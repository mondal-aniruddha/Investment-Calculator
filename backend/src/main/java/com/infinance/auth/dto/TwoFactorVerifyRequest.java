package com.infinance.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record TwoFactorVerifyRequest(
    @NotBlank(message = "Challenge ID is required") String challengeId,
    String code,
    String backupCode
) {}

