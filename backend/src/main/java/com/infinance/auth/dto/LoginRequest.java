package com.infinance.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank String email,
    @NotBlank String password,
    String username
) {
    public LoginRequest(String email, String password) {
        this(email, password, null);
    }

    public String identifier() {
        if (username != null && !username.isBlank()) {
            return username.trim();
        }
        return email != null ? email.trim() : "";
    }
}
