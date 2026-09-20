package com.infinance.auth.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;

public final class AuthDtos {
    private AuthDtos() {}
    public record RegisterRequest(@Email @NotBlank String email, @Size(min=8, max=128) @NotBlank String password,
                                  @NotBlank @Size(max=120) String displayName, @Size(max=32) String phone) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record AuthResponse(String token, Instant expiresAt, ProfileResponse profile) {}
    public record ProfileResponse(String id, String email, String displayName, String phone, Instant createdAt) {}
    public record ProfileUpdateRequest(@NotBlank @Size(max=120) String displayName, @Size(max=32) String phone) {}
    public record ScenarioRequest(@NotBlank @Size(max=120) String name, @NotBlank @Size(max=40) String scenarioType,
                                  @NotNull Object payload) {}
    public record ScenarioResponse(String id, String name, String scenarioType, Object payload,
                                   Instant createdAt, Instant updatedAt) {}
    public record CompareRequest(@NotEmpty @Size(min=2, max=5) List<String> scenarioIds) {}
    public record CompareResponse(List<ScenarioResponse> scenarios) {}
}
