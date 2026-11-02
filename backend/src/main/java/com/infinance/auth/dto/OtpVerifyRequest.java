package com.infinance.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record OtpVerifyRequest(
    @NotBlank(message = "Challenge ID is required") String challengeId,
    @NotBlank(message = "Verification code is required") String code
) {}

