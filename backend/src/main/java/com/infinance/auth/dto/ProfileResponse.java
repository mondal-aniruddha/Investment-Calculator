package com.infinance.auth.dto;

import java.time.Instant;

public record ProfileResponse(
    String id,
    String email,
    String displayName,
    String phone,
    Instant createdAt,
    String username
) {
    public ProfileResponse(String id, String email, String displayName, String phone, Instant createdAt) {
        this(id, email, displayName, phone, createdAt, null);
    }
}
