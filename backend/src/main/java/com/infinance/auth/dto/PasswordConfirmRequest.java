package com.infinance.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record PasswordConfirmRequest(
    @NotBlank(message = "Password is required") String password,
    String code
) {}

