package com.infinance.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record OtpResendRequest(
    @NotBlank(message = "Challenge ID is required") String challengeId,
    String channel
) {}

