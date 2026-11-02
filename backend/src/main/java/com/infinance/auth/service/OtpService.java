package com.infinance.auth.service;

import com.infinance.auth.config.OtpProperties;
import com.infinance.auth.dto.OtpChannel;
import com.infinance.auth.dto.OtpPurpose;
import com.infinance.auth.entity.AuthAuditEventEntity;
import com.infinance.auth.entity.BackupCodeEntity;
import com.infinance.auth.entity.OtpChallengeEntity;
import com.infinance.auth.provider.OtpDeliveryProvider;
import com.infinance.auth.repository.AuthAuditEventRepository;
import com.infinance.auth.repository.BackupCodeRepository;
import com.infinance.auth.repository.OtpChallengeRepository;
import com.infinance.auth.repository.UserRepository;
import com.infinance.common.exception.InvalidFinancialInputException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final Pattern E164_PATTERN = Pattern.compile("^\\+[1-9]\\d{7,14}$");
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String BACKUP_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final OtpProperties properties;
    private final OtpDeliveryProvider deliveryProvider;
    private final OtpChallengeRepository challengeRepository;
    private final BackupCodeRepository backupCodeRepository;
    private final AuthAuditEventRepository auditRepository;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(
            OtpProperties properties,
            OtpDeliveryProvider deliveryProvider,
            OtpChallengeRepository challengeRepository,
            BackupCodeRepository backupCodeRepository,
            AuthAuditEventRepository auditRepository,
            UserRepository userRepository) {
        this.properties = properties;
        this.deliveryProvider = deliveryProvider;
        this.challengeRepository = challengeRepository;
        this.backupCodeRepository = backupCodeRepository;
        this.auditRepository = auditRepository;
        this.userRepository = userRepository;
    }

    public void validatePhoneNumber(String phoneE164) {
        if (phoneE164 == null || !E164_PATTERN.matcher(phoneE164.trim()).matches()) {
            throw new InvalidFinancialInputException("PHONE_INVALID",
                    "Phone number must be in valid E.164 format (e.g. +919876543210)");
        }
        String cleanPhone = phoneE164.trim();
        List<String> allowedCodes = properties.getAllowedCountryCodes();
        boolean allowed = allowedCodes.stream().anyMatch(cleanPhone::startsWith);
        if (!allowed) {
            throw new InvalidFinancialInputException("PHONE_COUNTRY_NOT_SUPPORTED",
                    "Only phone numbers from supported countries (" + String.join(", ", allowedCodes)
                            + ") are allowed");
        }
    }

    public String maskPhone(String phoneE164) {
        if (phoneE164 == null || phoneE164.length() < 7)
            return "***";
        int len = phoneE164.length();
        return phoneE164.substring(0, 3) + "******" + phoneE164.substring(len - 4);
    }

    @Transactional
    public ChallengeResult createChallenge(String userId, OtpPurpose purpose, OtpChannel channel, String phoneE164) {
        validatePhoneNumber(phoneE164);

        Instant oneHourAgo = Instant.now().minusSeconds(3600);
        long recentSends = challengeRepository.countByDestinationE164AndLastSentAtAfter(phoneE164, oneHourAgo);
        if (recentSends >= properties.getMaxSendsPerPhonePerHour()) {
            throw new InvalidFinancialInputException("OTP_HOURLY_LIMIT_EXCEEDED",
                    "Too many verification requests for this phone number. Please try again later.");
        }

        String rawCode = generateNumericCode(properties.getCodeLength());
        String codeHash = hash(rawCode);
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(properties.getTtlSeconds());

        OtpChallengeEntity challenge = new OtpChallengeEntity(
                userId,
                purpose.name(),
                channel.name(),
                phoneE164,
                codeHash,
                expiresAt);
        challengeRepository.save(challenge);

        deliveryProvider.send(channel, phoneE164, rawCode, "en");
        recordAuditEvent(userId, "OTP_SENT", maskPhone(phoneE164), "Purpose: " + purpose + ", Channel: " + channel);

        Instant resendAvailableAt = now.plusSeconds(properties.getResendCooldownSeconds());
        return new ChallengeResult(
                challenge.getId(),
                maskPhone(phoneE164),
                channel.name(),
                resendAvailableAt,
                expiresAt);
    }

    @Transactional
    public ChallengeResult resend(String challengeId, OtpChannel newChannel) {
        OtpChallengeEntity challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new InvalidFinancialInputException("OTP_CHALLENGE_NOT_FOUND",
                        "Verification challenge not found"));

        if (challenge.getConsumedAt() != null) {
            throw new InvalidFinancialInputException("OTP_CHALLENGE_NOT_FOUND",
                    "Verification challenge has already been used");
        }
        if (challenge.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidFinancialInputException("OTP_EXPIRED",
                    "Verification challenge has expired. Please start over.");
        }

        Instant now = Instant.now();
        Instant cooldownThreshold = challenge.getLastSentAt().plusSeconds(properties.getResendCooldownSeconds());
        if (now.isBefore(cooldownThreshold)) {
            throw new InvalidFinancialInputException("OTP_COOLDOWN", "Please wait before requesting another code.");
        }

        Instant oneHourAgo = now.minusSeconds(3600);
        long recentSends = challengeRepository.countByDestinationE164AndLastSentAtAfter(challenge.getDestinationE164(),
                oneHourAgo);
        if (recentSends >= properties.getMaxSendsPerPhonePerHour()) {
            throw new InvalidFinancialInputException("OTP_HOURLY_LIMIT_EXCEEDED",
                    "Too many verification requests for this phone number. Please try again later.");
        }

        OtpChannel channelToSend = newChannel != null ? newChannel : OtpChannel.fromString(challenge.getChannel());
        String newRawCode = generateNumericCode(properties.getCodeLength());
        String newCodeHash = hash(newRawCode);

        challenge.setChannel(channelToSend.name());
        challenge.setCodeHash(newCodeHash);
        challenge.setLastSentAt(now);
        challenge.setExpiresAt(now.plusSeconds(properties.getTtlSeconds()));
        challenge.incrementSendCount();
        challengeRepository.save(challenge);

        deliveryProvider.send(channelToSend, challenge.getDestinationE164(), newRawCode, "en");
        recordAuditEvent(challenge.getUserId(), "OTP_SENT", maskPhone(challenge.getDestinationE164()),
                "Resend Purpose: " + challenge.getPurpose() + ", Channel: " + channelToSend);

        Instant resendAvailableAt = now.plusSeconds(properties.getResendCooldownSeconds());
        return new ChallengeResult(
                challenge.getId(),
                maskPhone(challenge.getDestinationE164()),
                channelToSend.name(),
                resendAvailableAt,
                challenge.getExpiresAt());
    }

    @Transactional
    public String verifyChallenge(String challengeId, String rawCode, OtpPurpose expectedPurpose) {
        OtpChallengeEntity challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new InvalidFinancialInputException("OTP_CHALLENGE_NOT_FOUND",
                        "Verification challenge not found"));

        if (challenge.getConsumedAt() != null) {
            throw new InvalidFinancialInputException("OTP_CHALLENGE_NOT_FOUND",
                    "Verification challenge has already been consumed");
        }
        if (challenge.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidFinancialInputException("OTP_EXPIRED",
                    "Verification code has expired. Please request a new one.");
        }
        if (challenge.getAttempts() >= properties.getMaxAttempts()) {
            throw new InvalidFinancialInputException("OTP_ATTEMPTS_EXCEEDED",
                    "Maximum verification attempts exceeded. Please request a new code.");
        }
        if (!challenge.getPurpose().equalsIgnoreCase(expectedPurpose.name())) {
            throw new InvalidFinancialInputException("OTP_INVALID", "Challenge purpose mismatch");
        }

        String inputHash = hash(rawCode != null ? rawCode.trim() : "");
        boolean matches = constantTimeEquals(challenge.getCodeHash(), inputHash);

        if (!matches) {
            challenge.incrementAttempts();
            challengeRepository.save(challenge);
            recordAuditEvent(challenge.getUserId(), "OTP_FAILED", maskPhone(challenge.getDestinationE164()),
                    "Attempt: " + challenge.getAttempts());
            if (challenge.getAttempts() >= properties.getMaxAttempts()) {
                throw new InvalidFinancialInputException("OTP_ATTEMPTS_EXCEEDED",
                        "Maximum verification attempts exceeded. Please request a new code.");
            }
            throw new InvalidFinancialInputException("OTP_INVALID", "Invalid verification code");
        }

        challenge.setConsumedAt(Instant.now());
        challengeRepository.save(challenge);
        recordAuditEvent(challenge.getUserId(), "OTP_VERIFIED", maskPhone(challenge.getDestinationE164()),
                "Purpose: " + expectedPurpose);
        return challenge.getUserId();
    }

    @Transactional
    public List<String> generateBackupCodes(String userId) {
        backupCodeRepository.deleteByUserId(userId);
        List<String> plainCodes = new ArrayList<>(10);
        for (int i = 0; i < 10; i++) {
            String plain = generateRandomBackupCode();
            plainCodes.add(plain);
            BackupCodeEntity entity = new BackupCodeEntity(userId, hash(plain));
            backupCodeRepository.save(entity);
        }
        recordAuditEvent(userId, "BACKUP_CODES_GENERATED", null, "Count: 10");
        return plainCodes;
    }

    @Transactional
    public boolean verifyBackupCode(String userId, String rawBackupCode) {
        if (rawBackupCode == null || rawBackupCode.isBlank()) {
            throw new InvalidFinancialInputException("BACKUP_CODE_INVALID", "Backup code is required");
        }
        String normalized = rawBackupCode.trim().toUpperCase().replace("-", "");
        String targetHash = hash(normalized);

        List<BackupCodeEntity> availableCodes = backupCodeRepository.findByUserIdAndUsedAtIsNull(userId);
        for (BackupCodeEntity code : availableCodes) {
            if (constantTimeEquals(code.getCodeHash(), targetHash)) {
                code.setUsedAt(Instant.now());
                backupCodeRepository.save(code);
                recordAuditEvent(userId, "BACKUP_CODE_USED", null, "Remaining: " + (availableCodes.size() - 1));
                return true;
            }
        }
        recordAuditEvent(userId, "BACKUP_CODE_FAILED", null, null);
        throw new InvalidFinancialInputException("BACKUP_CODE_INVALID", "Invalid or already used backup code");
    }

    public long getBackupCodesRemaining(String userId) {
        return backupCodeRepository.countByUserIdAndUsedAtIsNull(userId);
    }

    public void recordAuditEvent(String userId, String eventType, String destinationMasked, String details) {
        try {
            AuthAuditEventEntity event = new AuthAuditEventEntity(userId, eventType, destinationMasked, details);
            auditRepository.save(event);
        } catch (Exception e) {
            log.error("Failed to persist auth audit event: {}", e.getMessage());
        }
    }

    @Scheduled(cron = "${infinance.otp.cleanup-cron:0 0 * * * *}")
    @Transactional
    public void purgeExpiredData() {
        Instant challengeExpiryThreshold = Instant.now().minusSeconds(86400);
        challengeRepository.deleteByExpiresAtBefore(challengeExpiryThreshold);

        Instant userSignupThreshold = Instant.now().minusSeconds(86400);
        userRepository.deleteByStatusAndCreatedAtBefore("PENDING_VERIFICATION", userSignupThreshold);
        log.debug("Purged expired challenges and abandoned unverified signups older than 24h");
    }

    public String hash(String input) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(properties.getSecret().getBytes(StandardCharsets.UTF_8),
                    HMAC_ALGORITHM);
            mac.init(keySpec);
            byte[] hmac = mac.doFinal(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hmac);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to calculate HMAC hash", e);
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null)
            return false;
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }

    private String generateNumericCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(secureRandom.nextInt(10));
        }
        return sb.toString();
    }

    private String generateRandomBackupCode() {
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            int idx = secureRandom.nextInt(BACKUP_CODE_CHARS.length());
            sb.append(BACKUP_CODE_CHARS.charAt(idx));
        }
        return sb.toString();
    }

    public record ChallengeResult(
            String challengeId,
            String maskedPhone,
            String channel,
            Instant resendAvailableAt,
            Instant expiresAt) {
    }
}
