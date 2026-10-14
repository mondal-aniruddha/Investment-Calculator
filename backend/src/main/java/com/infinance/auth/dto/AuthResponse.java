package com.infinance.auth.dto;

import java.time.Instant;

public record AuthResponse(
    String token,
    Instant expiresAt,
    ProfileResponse profile
) {}
