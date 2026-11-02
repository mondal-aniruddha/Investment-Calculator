package com.infinance.auth.service;

import com.infinance.auth.config.OtpProperties;
import com.infinance.auth.dto.OtpChannel;
import com.infinance.auth.dto.OtpPurpose;
import com.infinance.auth.entity.BackupCodeEntity;
import com.infinance.auth.entity.OtpChallengeEntity;
import com.infinance.auth.provider.OtpDeliveryProvider;
import com.infinance.auth.repository.AuthAuditEventRepository;
import com.infinance.auth.repository.BackupCodeRepository;
import com.infinance.auth.repository.OtpChallengeRepository;
import com.infinance.auth.repository.UserRepository;
import com.infinance.common.exception.InvalidFinancialInputException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class OtpServiceTest {

    private OtpProperties properties;
    private OtpDeliveryProvider deliveryProvider;
    private OtpChallengeRepository challengeRepository;
    private BackupCodeRepository backupCodeRepository;
    private AuthAuditEventRepository auditRepository;
    private UserRepository userRepository;
    private OtpService otpService;

    @BeforeEach
    void setUp() {
        properties = new OtpProperties();
        properties.setSecret("test-secret-at-least-32-characters-long-key");
        properties.setCodeLength(6);
        properties.setTtlSeconds(300);
        properties.setMaxAttempts(5);
        properties.setResendCooldownSeconds(60);
        properties.setMaxSendsPerPhonePerHour(5);
        properties.setAllowedCountryCodes(List.of("+91"));

        deliveryProvider = mock(OtpDeliveryProvider.class);
        challengeRepository = mock(OtpChallengeRepository.class);
        backupCodeRepository = mock(BackupCodeRepository.class);
        auditRepository = mock(AuthAuditEventRepository.class);
        userRepository = mock(UserRepository.class);

        otpService = new OtpService(
                properties,
                deliveryProvider,
                challengeRepository,
                backupCodeRepository,
                auditRepository,
                userRepository
        );
    }

    @Test
    @DisplayName("Phone validation allows valid +91 E.164 and rejects unsupported or invalid numbers")
    void testPhoneNumberValidation() {
        otpService.validatePhoneNumber("+919876543210");

        assertThatThrownBy(() -> otpService.validatePhoneNumber("9876543210"))
                .isInstanceOf(InvalidFinancialInputException.class)
                .hasMessageContaining("E.164");

        assertThatThrownBy(() -> otpService.validatePhoneNumber("+14155552671"))
                .isInstanceOf(InvalidFinancialInputException.class)
                .hasMessageContaining("supported countries");
    }

    @Test
    @DisplayName("maskPhone masks correctly without leaking digits")
    void testMaskPhone() {
        assertThat(otpService.maskPhone("+919876543210")).isEqualTo("+91******3210");
        assertThat(otpService.maskPhone("+918013292565")).isEqualTo("+91******2565");
    }

    @Test
    @DisplayName("createChallenge stores only keyed hash and dispatches code")
    void testCreateChallenge() {
        when(challengeRepository.countByDestinationE164AndLastSentAtAfter(any(), any())).thenReturn(0L);

        ArgumentCaptor<String> codeCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<OtpChallengeEntity> challengeCaptor = ArgumentCaptor.forClass(OtpChallengeEntity.class);

        OtpService.ChallengeResult result = otpService.createChallenge("user-1", OtpPurpose.SIGNUP_PHONE, OtpChannel.SMS, "+919876543210");

        assertThat(result.challengeId()).isNotNull();
        assertThat(result.maskedPhone()).isEqualTo("+91******3210");
        assertThat(result.channel()).isEqualTo("SMS");

        verify(deliveryProvider).send(eq(OtpChannel.SMS), eq("+919876543210"), codeCaptor.capture(), eq("en"));
        verify(challengeRepository).save(challengeCaptor.capture());

        String dispatchedCode = codeCaptor.getValue();
        OtpChallengeEntity saved = challengeCaptor.getValue();

        assertThat(dispatchedCode).hasSize(6);
        // Code hash must match the HMAC of dispatched code and NOT be plain text
        assertThat(saved.getCodeHash()).isEqualTo(otpService.hash(dispatchedCode));
        assertThat(saved.getCodeHash()).isNotEqualTo(dispatchedCode);
    }

    @Test
    @DisplayName("verifyChallenge succeeds with correct code and consumes challenge")
    void testVerifyChallengeSuccess() {
        String rawCode = "123456";
        String codeHash = otpService.hash(rawCode);
        OtpChallengeEntity entity = new OtpChallengeEntity(
                "user-1",
                OtpPurpose.SIGNUP_PHONE.name(),
                "SMS",
                "+919876543210",
                codeHash,
                Instant.now().plusSeconds(300)
        );

        when(challengeRepository.findById(entity.getId())).thenReturn(Optional.of(entity));

        String verifiedUserId = otpService.verifyChallenge(entity.getId(), "123456", OtpPurpose.SIGNUP_PHONE);

        assertThat(verifiedUserId).isEqualTo("user-1");
        assertThat(entity.getConsumedAt()).isNotNull();
        verify(challengeRepository).save(entity);
    }

    @Test
    @DisplayName("verifyChallenge rejects expired challenges")
    void testVerifyExpiredChallenge() {
        OtpChallengeEntity entity = new OtpChallengeEntity(
                "user-1",
                OtpPurpose.SIGNUP_PHONE.name(),
                "SMS",
                "+919876543210",
                otpService.hash("123456"),
                Instant.now().minusSeconds(10) // already expired
        );

        when(challengeRepository.findById(entity.getId())).thenReturn(Optional.of(entity));

        assertThatThrownBy(() -> otpService.verifyChallenge(entity.getId(), "123456", OtpPurpose.SIGNUP_PHONE))
                .isInstanceOf(InvalidFinancialInputException.class)
                .hasMessageContaining("expired");
    }

    @Test
    @DisplayName("verifyChallenge locks challenge after 5 failed attempts")
    void testVerifyChallengeLockout() {
        OtpChallengeEntity entity = new OtpChallengeEntity(
                "user-1",
                OtpPurpose.SIGNUP_PHONE.name(),
                "SMS",
                "+919876543210",
                otpService.hash("123456"),
                Instant.now().plusSeconds(300)
        );
        entity.setAttempts(4); // 4 prior failures

        when(challengeRepository.findById(entity.getId())).thenReturn(Optional.of(entity));

        // 5th failure
        assertThatThrownBy(() -> otpService.verifyChallenge(entity.getId(), "999999", OtpPurpose.SIGNUP_PHONE))
                .isInstanceOf(InvalidFinancialInputException.class)
                .hasMessageContaining("Maximum verification attempts exceeded");

        assertThat(entity.getAttempts()).isEqualTo(5);
    }

    @Test
    @DisplayName("verifyChallenge rejects already consumed challenge")
    void testConsumedChallengeSingleUse() {
        OtpChallengeEntity entity = new OtpChallengeEntity(
                "user-1",
                OtpPurpose.SIGNUP_PHONE.name(),
                "SMS",
                "+919876543210",
                otpService.hash("123456"),
                Instant.now().plusSeconds(300)
        );
        entity.setConsumedAt(Instant.now());

        when(challengeRepository.findById(entity.getId())).thenReturn(Optional.of(entity));

        assertThatThrownBy(() -> otpService.verifyChallenge(entity.getId(), "123456", OtpPurpose.SIGNUP_PHONE))
                .isInstanceOf(InvalidFinancialInputException.class)
                .hasMessageContaining("consumed");
    }

    @Test
    @DisplayName("resend enforces cooldown and invalidates old code")
    void testResendCooldownAndInvalidation() {
        String oldCode = "111111";
        OtpChallengeEntity entity = new OtpChallengeEntity(
                "user-1",
                OtpPurpose.SIGNUP_PHONE.name(),
                "SMS",
                "+919876543210",
                otpService.hash(oldCode),
                Instant.now().plusSeconds(300)
        );
        // last sent 10 seconds ago (cooldown is 60s)
        entity.setLastSentAt(Instant.now().minusSeconds(10));

        when(challengeRepository.findById(entity.getId())).thenReturn(Optional.of(entity));

        assertThatThrownBy(() -> otpService.resend(entity.getId(), OtpChannel.WHATSAPP))
                .isInstanceOf(InvalidFinancialInputException.class)
                .hasMessageContaining("Please wait");

        // Advance last sent beyond cooldown
        entity.setLastSentAt(Instant.now().minusSeconds(65));
        when(challengeRepository.countByDestinationE164AndLastSentAtAfter(any(), any())).thenReturn(0L);

        ArgumentCaptor<String> newCodeCaptor = ArgumentCaptor.forClass(String.class);
        OtpService.ChallengeResult resendResult = otpService.resend(entity.getId(), OtpChannel.WHATSAPP);

        assertThat(resendResult.channel()).isEqualTo("WHATSAPP");
        verify(deliveryProvider).send(eq(OtpChannel.WHATSAPP), eq("+919876543210"), newCodeCaptor.capture(), eq("en"));

        String newCode = newCodeCaptor.getValue();
        // Old code hash should no longer match entity's codeHash
        assertThat(entity.getCodeHash()).isEqualTo(otpService.hash(newCode));
        assertThat(entity.getCodeHash()).isNotEqualTo(otpService.hash(oldCode));
    }

    @Test
    @DisplayName("Hourly limit prevents sending more than 5 OTPs per hour to a single phone")
    void testHourlySendCap() {
        when(challengeRepository.countByDestinationE164AndLastSentAtAfter(eq("+919876543210"), any())).thenReturn(5L);

        assertThatThrownBy(() -> otpService.createChallenge("user-1", OtpPurpose.SIGNUP_PHONE, OtpChannel.SMS, "+919876543210"))
                .isInstanceOf(InvalidFinancialInputException.class)
                .hasMessageContaining("Too many verification requests");
    }

    @Test
    @DisplayName("Backup codes are generated, hashed, verified once, and consumed")
    void testBackupCodeLifecycle() {
        List<String> plainCodes = otpService.generateBackupCodes("user-1");

        assertThat(plainCodes).hasSize(10);
        verify(backupCodeRepository, times(10)).save(any());

        String codeToUse = plainCodes.get(0);
        String hashed = otpService.hash(codeToUse);

        BackupCodeEntity entity = new BackupCodeEntity("user-1", hashed);
        when(backupCodeRepository.findByUserIdAndUsedAtIsNull("user-1")).thenReturn(new ArrayList<>(List.of(entity)));

        boolean verified = otpService.verifyBackupCode("user-1", codeToUse);
        assertThat(verified).isTrue();
        assertThat(entity.getUsedAt()).isNotNull();

        // Second attempt with same code fails because entity is now used
        when(backupCodeRepository.findByUserIdAndUsedAtIsNull("user-1")).thenReturn(List.of());
        assertThatThrownBy(() -> otpService.verifyBackupCode("user-1", codeToUse))
                .isInstanceOf(InvalidFinancialInputException.class)
                .hasMessageContaining("Invalid or already used backup code");
    }
}

