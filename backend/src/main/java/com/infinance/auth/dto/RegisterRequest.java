package com.infinance.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @Email @NotBlank String email,
    @Size(min = 8, max = 128) @NotBlank String password,
    @NotBlank @Size(max = 120) String displayName,
    @NotBlank @Pattern(regexp = "^\\+[1-9]\\d{7,14}$", message = "Phone number must be in E.164 format (e.g. +919876543210)") String phone,
    @Pattern(regexp = "^$|^[a-zA-Z0-9_.-]{3,50}$", message = "Username must be 3-50 alphanumeric characters, dots, hyphens, or underscores") String username,
    String channel
) {
    public RegisterRequest(String email, String password, String displayName, String phone) {
        this(email, password, displayName, phone, null, null);
    }

    public RegisterRequest(String email, String password, String displayName, String phone, String username) {
        this(email, password, displayName, phone, username, null);
    }
}
