package com.infinance.auth.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;

public final class AuthDtos {
    private AuthDtos() {}
    public record RegisterRequest(
        @Email @NotBlank String email,
        @Size(min=8, max=128) @NotBlank String password,
        @NotBlank @Size(max=120) String displayName,
        @Size(max=32) String phone,
        @Pattern(regexp="^$|^[a-zA-Z0-9_.-]{3,50}$", message="Username must be 3-50 alphanumeric characters, dots, hyphens, or underscores") String username
    ) {
        public RegisterRequest(String email, String password, String displayName, String phone) {
            this(email, password, displayName, phone, null);
        }
    }
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
    public record AuthResponse(String token, Instant expiresAt, ProfileResponse profile) {}
    public record ProfileResponse(String id, String email, String displayName, String phone, Instant createdAt, String username) {
        public ProfileResponse(String id, String email, String displayName, String phone, Instant createdAt) {
            this(id, email, displayName, phone, createdAt, null);
        }
    }
    public record ProfileUpdateRequest(@NotBlank @Size(max=120) String displayName, @Size(max=32) String phone) {}
    public record ScenarioRequest(@NotBlank @Size(max=120) String name, @NotBlank @Size(max=40) String scenarioType,
                                  @NotNull Object payload) {}
    public record ScenarioResponse(String id, String name, String scenarioType, Object payload,
                                   Instant createdAt, Instant updatedAt) {}
    public record CompareRequest(@NotEmpty @Size(min=2, max=5) List<String> scenarioIds) {}
    public record CompareResponse(List<ScenarioResponse> scenarios) {}
}
