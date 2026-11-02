package com.infinance.auth.service;

import com.infinance.auth.dto.*;
import com.infinance.auth.entity.OtpChallengeEntity;
import com.infinance.auth.entity.UserEntity;
import com.infinance.auth.repository.AuthAuditEventRepository;
import com.infinance.auth.repository.BackupCodeRepository;
import com.infinance.auth.repository.OtpChallengeRepository;
import com.infinance.auth.repository.SavedScenarioRepository;
import com.infinance.auth.repository.UserRepository;
import com.infinance.common.exception.InvalidFinancialInputException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository users;
    private final SavedScenarioRepository scenarios;
    private final OtpChallengeRepository challengeRepository;
    private final BackupCodeRepository backupCodeRepository;
    private final AuthAuditEventRepository auditRepository;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final OtpService otpService;

    public AuthService(
            UserRepository users,
            SavedScenarioRepository scenarios,
            OtpChallengeRepository challengeRepository,
            BackupCodeRepository backupCodeRepository,
            AuthAuditEventRepository auditRepository,
            PasswordEncoder encoder,
            JwtService jwt,
            OtpService otpService
    ) {
        this.users = users;
        this.scenarios = scenarios;
        this.challengeRepository = challengeRepository;
        this.backupCodeRepository = backupCodeRepository;
        this.auditRepository = auditRepository;
        this.encoder = encoder;
        this.jwt = jwt;
        this.otpService = otpService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        validatePasswordComplexity(request.password());
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            throw new InvalidFinancialInputException("EMAIL_IN_USE", "An account already exists for this email");
        }

        String username = (request.username() != null && !request.username().isBlank()) ? request.username().trim() : null;
        if (username != null && users.existsByUsernameIgnoreCase(username)) {
            throw new InvalidFinancialInputException("USERNAME_IN_USE", "An account already exists for this username");
        }

        String phoneE164 = request.phone().trim();
        otpService.validatePhoneNumber(phoneE164);
        if (users.existsByPhoneE164(phoneE164)) {
            throw new InvalidFinancialInputException("PHONE_IN_USE", "An account already exists with this phone number");
        }

        UserEntity user = new UserEntity(
                email,
                encoder.encode(request.password()),
                request.displayName().trim(),
                phoneE164,
                phoneE164,
                false,
                null,
                true,
                "PENDING_VERIFICATION",
                username
        );
        user = users.save(user);

        OtpChannel channel = OtpChannel.fromString(request.channel());
        OtpService.ChallengeResult challenge = otpService.createChallenge(user.getId(), OtpPurpose.SIGNUP_PHONE, channel, phoneE164);

        return AuthResponse.ofVerificationRequired(
                challenge.challengeId(),
                challenge.maskedPhone(),
                challenge.channel(),
                challenge.resendAvailableAt(),
                challenge.expiresAt()
        );
    }

    @Transactional
    public AuthResponse verifyRegistration(OtpVerifyRequest request) {
        String userId = otpService.verifyChallenge(request.challengeId(), request.code(), OtpPurpose.SIGNUP_PHONE);
        UserEntity user = find(userId);
        user.setStatus("ACTIVE");
        user.setPhoneVerified(true);
        user.setPhoneVerifiedAt(Instant.now());
        user = users.save(user);

        List<String> backupCodes = null;
        if (user.isTwoFactorEnabled()) {
            backupCodes = otpService.generateBackupCodes(userId);
        }

        otpService.recordAuditEvent(user.getId(), "ACCOUNT_ACTIVATED", otpService.maskPhone(user.getPhoneE164()), null);
        return new AuthResponse(
                jwt.createToken(user.getId(), user.getEmail()),
                jwt.expiresAt(),
                toProfile(user),
                false,
                false,
                null,
                null,
                null,
                null,
                backupCodes != null && !backupCodes.isEmpty(),
                backupCodes
        );
    }

    @Transactional
    public AuthResponse resendOtp(OtpResendRequest request) {
        OtpChannel channel = (request.channel() != null && !request.channel().isBlank())
                ? OtpChannel.fromString(request.channel())
                : null;
        OtpService.ChallengeResult result = otpService.resend(request.challengeId(), channel);
        return AuthResponse.ofVerificationRequired(
                result.challengeId(),
                result.maskedPhone(),
                result.channel(),
                result.resendAvailableAt(),
                result.expiresAt()
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String identifier = request.identifier();
        UserEntity user = users.findByEmailIgnoreCaseOrUsernameIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new InvalidFinancialInputException("INVALID_CREDENTIALS", "Invalid email or password"));

        if (!encoder.matches(request.password(), user.getPasswordHash())) {
            otpService.recordAuditEvent(user.getId(), "LOGIN_FAILED", null, "Bad password");
            throw new InvalidFinancialInputException("INVALID_CREDENTIALS", "Invalid email or password");
        }

        if ("PENDING_VERIFICATION".equalsIgnoreCase(user.getStatus())) {
            OtpService.ChallengeResult freshChallenge = otpService.createChallenge(
                    user.getId(),
                    OtpPurpose.SIGNUP_PHONE,
                    OtpChannel.SMS,
                    user.getPhoneE164()
            );
            throw new InvalidFinancialInputException(
                    "PHONE_NOT_VERIFIED",
                    "Account requires phone verification. Fresh challenge: " + freshChallenge.challengeId()
            );
        }

        if (user.isTwoFactorEnabled()) {
            OtpService.ChallengeResult challenge = otpService.createChallenge(
                    user.getId(),
                    OtpPurpose.LOGIN_2FA,
                    OtpChannel.SMS,
                    user.getPhoneE164()
            );
            long backupCount = otpService.getBackupCodesRemaining(user.getId());
            return AuthResponse.ofTwoFactorRequired(
                    challenge.challengeId(),
                    challenge.maskedPhone(),
                    challenge.channel(),
                    challenge.resendAvailableAt(),
                    backupCount > 0
            );
        }

        otpService.recordAuditEvent(user.getId(), "LOGIN_SUCCESS", null, "Standard credentials login");
        return response(user);
    }

    @Transactional
    public AuthResponse verifyTwoFactor(TwoFactorVerifyRequest request) {
        OtpChallengeEntity challenge = challengeRepository.findById(request.challengeId())
                .orElseThrow(() -> new InvalidFinancialInputException("OTP_CHALLENGE_NOT_FOUND", "Verification challenge not found"));

        if (challenge.getConsumedAt() != null) {
            throw new InvalidFinancialInputException("OTP_CHALLENGE_NOT_FOUND", "Verification challenge has already been consumed");
        }

        UserEntity user = find(challenge.getUserId());

        if (request.backupCode() != null && !request.backupCode().isBlank()) {
            otpService.verifyBackupCode(user.getId(), request.backupCode());
            challenge.setConsumedAt(Instant.now());
            challengeRepository.save(challenge);
            otpService.recordAuditEvent(user.getId(), "LOGIN_SUCCESS", null, "2FA via backup code");
            return response(user);
        }

        if (request.code() != null && !request.code().isBlank()) {
            otpService.verifyChallenge(request.challengeId(), request.code(), OtpPurpose.LOGIN_2FA);
            otpService.recordAuditEvent(user.getId(), "LOGIN_SUCCESS", null, "2FA via OTP");
            return response(user);
        }

        throw new InvalidFinancialInputException("OTP_INVALID", "Verification code or backup code is required");
    }

    public TwoFactorStatusResponse getTwoFactorStatus(String userId) {
        UserEntity user = find(userId);
        long backupCodesCount = otpService.getBackupCodesRemaining(userId);
        return new TwoFactorStatusResponse(
                user.isTwoFactorEnabled(),
                user.isPhoneVerified(),
                otpService.maskPhone(user.getPhoneE164()),
                backupCodesCount
        );
    }

    @Transactional
    public AuthResponse startEnableTwoFactor(String userId, String channel) {
        UserEntity user = find(userId);
        if (!user.isPhoneVerified() || user.getPhoneE164() == null) {
            throw new InvalidFinancialInputException("PHONE_NOT_VERIFIED", "Please verify your phone number before enabling 2FA");
        }
        OtpChannel otpChannel = OtpChannel.fromString(channel);
        OtpService.ChallengeResult result = otpService.createChallenge(
                userId,
                OtpPurpose.ENABLE_2FA,
                otpChannel,
                user.getPhoneE164()
        );
        return AuthResponse.ofVerificationRequired(
                result.challengeId(),
                result.maskedPhone(),
                result.channel(),
                result.resendAvailableAt(),
                result.expiresAt()
        );
    }

    @Transactional
    public BackupCodesResponse completeEnableTwoFactor(String userId, OtpVerifyRequest request) {
        String verifiedUserId = otpService.verifyChallenge(request.challengeId(), request.code(), OtpPurpose.ENABLE_2FA);
        if (!userId.equals(verifiedUserId)) {
            throw new InvalidFinancialInputException("OTP_INVALID", "Challenge does not belong to the current user");
        }
        UserEntity user = find(userId);
        user.setTwoFactorEnabled(true);
        users.save(user);

        List<String> codes = otpService.generateBackupCodes(userId);
        otpService.recordAuditEvent(userId, "2FA_ENABLED", otpService.maskPhone(user.getPhoneE164()), null);
        return new BackupCodesResponse(codes);
    }

    @Transactional
    public void disableTwoFactor(String userId, PasswordConfirmRequest request, String challengeId) {
        UserEntity user = find(userId);
        if (!encoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidFinancialInputException("INVALID_CREDENTIALS", "Incorrect current password");
        }
        if (challengeId != null && request.code() != null) {
            otpService.verifyChallenge(challengeId, request.code(), OtpPurpose.ENABLE_2FA);
        }
        user.setTwoFactorEnabled(false);
        users.save(user);
        backupCodeRepository.deleteByUserId(userId);
        otpService.recordAuditEvent(userId, "2FA_DISABLED", null, null);
    }

    @Transactional
    public BackupCodesResponse regenerateBackupCodes(String userId, PasswordConfirmRequest request, String challengeId) {
        UserEntity user = find(userId);
        if (!user.isTwoFactorEnabled()) {
            throw new InvalidFinancialInputException("TWO_FACTOR_NOT_ENABLED", "Two-factor authentication is not enabled");
        }
        if (!encoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidFinancialInputException("INVALID_CREDENTIALS", "Incorrect current password");
        }
        if (challengeId != null && request.code() != null) {
            otpService.verifyChallenge(challengeId, request.code(), OtpPurpose.ENABLE_2FA);
        }
        List<String> codes = otpService.generateBackupCodes(userId);
        otpService.recordAuditEvent(userId, "BACKUP_CODES_REGENERATED", null, null);
        return new BackupCodesResponse(codes);
    }

    @Transactional
    public AuthResponse changePhone(String userId, PhoneChangeRequest request) {
        UserEntity user = find(userId);
        if (!encoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidFinancialInputException("INVALID_CREDENTIALS", "Incorrect password");
        }
        String newPhone = request.newPhone().trim();
        otpService.validatePhoneNumber(newPhone);
        if (users.existsByPhoneE164(newPhone)) {
            throw new InvalidFinancialInputException("PHONE_IN_USE", "This phone number is already registered to another account");
        }

        OtpChannel channel = OtpChannel.fromString(request.channel());
        OtpService.ChallengeResult result = otpService.createChallenge(userId, OtpPurpose.CHANGE_PHONE, channel, newPhone);
        return AuthResponse.ofVerificationRequired(
                result.challengeId(),
                result.maskedPhone(),
                result.channel(),
                result.resendAvailableAt(),
                result.expiresAt()
        );
    }

    @Transactional
    public ProfileResponse verifyChangePhone(String userId, PhoneChangeVerifyRequest request) {
        OtpChallengeEntity challenge = challengeRepository.findById(request.challengeId())
                .orElseThrow(() -> new InvalidFinancialInputException("OTP_CHALLENGE_NOT_FOUND", "Verification challenge not found"));

        if (!userId.equals(challenge.getUserId())) {
            throw new InvalidFinancialInputException("OTP_INVALID", "Challenge does not belong to the authenticated user");
        }

        otpService.verifyChallenge(request.challengeId(), request.code(), OtpPurpose.CHANGE_PHONE);
        UserEntity user = find(userId);
        user.setPhoneE164(challenge.getDestinationE164());
        user.setPhone(challenge.getDestinationE164());
        user.setPhoneVerified(true);
        user.setPhoneVerifiedAt(Instant.now());
        user = users.save(user);

        otpService.recordAuditEvent(userId, "PHONE_CHANGED", otpService.maskPhone(user.getPhoneE164()), null);
        return toProfile(user);
    }

    public ProfileResponse profile(String id) {
        return toProfile(find(id));
    }

    @Transactional
    public ProfileResponse update(String id, ProfileUpdateRequest request) {
        UserEntity u = find(id);
        u.setDisplayName(request.displayName().trim());
        // Direct phone updates are forbidden to maintain verified phone integrity; changes must use /phone/change
        return toProfile(users.save(u));
    }

    @Transactional
    public void delete(String id) {
        find(id);
        auditRepository.deleteByUserId(id);
        backupCodeRepository.deleteByUserId(id);
        challengeRepository.deleteByUserId(id);
        scenarios.deleteByUserId(id);
        users.deleteById(id);
    }

    public UserEntity find(String id) {
        return users.findById(id).orElseThrow(() -> new InvalidFinancialInputException("ACCOUNT_NOT_FOUND", "Account not found"));
    }

    public ProfileResponse toProfile(UserEntity u) {
        return new ProfileResponse(
                u.getId(),
                u.getEmail(),
                u.getDisplayName(),
                u.getPhone(),
                u.getCreatedAt(),
                u.getUsername(),
                u.isPhoneVerified(),
                u.isTwoFactorEnabled()
        );
    }

    private AuthResponse response(UserEntity u) {
        return new AuthResponse(jwt.createToken(u.getId(), u.getEmail()), jwt.expiresAt(), toProfile(u));
    }

    private void validatePasswordComplexity(String password) {
        if (password == null || password.length() < 8) {
            throw new InvalidFinancialInputException("WEAK_PASSWORD", "Password must be at least 8 characters long");
        }
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
        }
        if (!hasUpper || !hasLower || !hasDigit) {
            throw new InvalidFinancialInputException("WEAK_PASSWORD", "Password must contain at least one uppercase letter, one lowercase letter, and one digit");
        }
    }
}
