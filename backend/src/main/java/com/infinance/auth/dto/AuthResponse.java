package com.infinance.auth.dto;

import java.time.Instant;
import java.util.List;

public record AuthResponse(
    String token,
    Instant expiresAt,
    ProfileResponse profile,
    boolean verificationRequired,
    boolean twoFactorRequired,
    String challengeId,
    String maskedPhone,
    String channel,
    Instant resendAvailableAt,
    Boolean backupCodesAvailable,
    List<String> backupCodes
) {
    public AuthResponse(String token, Instant expiresAt, ProfileResponse profile) {
        this(token, expiresAt, profile, false, false, null, null, null, null, null, null);
    }

    public static AuthResponse ofVerificationRequired(
            String challengeId,
            String maskedPhone,
            String channel,
            Instant resendAvailableAt,
            Instant expiresAt
    ) {
        return new AuthResponse(null, expiresAt, null, true, false, challengeId, maskedPhone, channel, resendAvailableAt, null, null);
    }

    public static AuthResponse ofTwoFactorRequired(
            String challengeId,
            String maskedPhone,
            String channel,
            Instant resendAvailableAt,
            boolean backupCodesAvailable
    ) {
        return new AuthResponse(null, null, null, false, true, challengeId, maskedPhone, channel, resendAvailableAt, backupCodesAvailable, null);
    }
}
