package com.infinance.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PhoneChangeRequest(
    @NotBlank(message = "Password is required") String password,
    @NotBlank(message = "New phone number is required")
    @Pattern(regexp = "^\\+[1-9]\\d{7,14}$", message = "Phone number must be in E.164 format")
    String newPhone,
    String channel
) {}

