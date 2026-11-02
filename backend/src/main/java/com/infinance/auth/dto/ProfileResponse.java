package com.infinance.auth.dto;

import java.time.Instant;

public record ProfileResponse(
    String id,
    String email,
    String displayName,
    String phone,
    Instant createdAt,
    String username,
    boolean phoneVerified,
    boolean twoFactorEnabled
) {
    public ProfileResponse(String id, String email, String displayName, String phone, Instant createdAt) {
        this(id, email, displayName, phone, createdAt, null, false, false);
    }

    public ProfileResponse(String id, String email, String displayName, String phone, Instant createdAt, String username) {
        this(id, email, displayName, phone, createdAt, username, false, false);
    }
}
