package com.infinance.auth.dto;

public record TwoFactorStatusResponse(
    boolean enabled,
    boolean phoneVerified,
    String maskedPhone,
    long backupCodesRemaining
) {}

