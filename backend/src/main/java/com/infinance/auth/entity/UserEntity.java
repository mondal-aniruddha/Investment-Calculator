package com.infinance.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "app_users")
public class UserEntity {
    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 320)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "display_name", nullable = false, length = 120)
    private String displayName;

    @Column(length = 32)
    private String phone;

    @Column(name = "phone_e164", length = 16, unique = true)
    private String phoneE164;

    @Column(name = "phone_verified", nullable = false)
    private boolean phoneVerified = false;

    @Column(name = "phone_verified_at")
    private Instant phoneVerifiedAt;

    @Column(name = "two_factor_enabled", nullable = false)
    private boolean twoFactorEnabled = false;

    @Column(name = "status", nullable = false, length = 24)
    private String status = "ACTIVE";

    @Column(length = 50, unique = true)
    private String username;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected UserEntity() {}

    public UserEntity(String email, String passwordHash, String displayName, String phone) {
        this(email, passwordHash, displayName, phone, null);
    }

    public UserEntity(String email, String passwordHash, String displayName, String phone, String username) {
        this(email, passwordHash, displayName, phone, phone, false, null, false, "ACTIVE", username);
    }

    public UserEntity(
            String email,
            String passwordHash,
            String displayName,
            String phone,
            String phoneE164,
            boolean phoneVerified,
            Instant phoneVerifiedAt,
            boolean twoFactorEnabled,
            String status,
            String username
    ) {
        this.id = java.util.UUID.randomUUID().toString();
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.phone = phone;
        this.phoneE164 = phoneE164;
        this.phoneVerified = phoneVerified;
        this.phoneVerifiedAt = phoneVerifiedAt;
        this.twoFactorEnabled = twoFactorEnabled;
        this.status = status != null ? status : "ACTIVE";
        this.username = username;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getDisplayName() { return displayName; }
    public String getPhone() { return phone; }
    public String getPhoneE164() { return phoneE164; }
    public boolean isPhoneVerified() { return phoneVerified; }
    public Instant getPhoneVerifiedAt() { return phoneVerifiedAt; }
    public boolean isTwoFactorEnabled() { return twoFactorEnabled; }
    public String getStatus() { return status; }
    public String getUsername() { return username; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setDisplayName(String v) { this.displayName = v; this.updatedAt = Instant.now(); }
    public void setPhone(String v) { this.phone = v; this.updatedAt = Instant.now(); }
    public void setPhoneE164(String v) { this.phoneE164 = v; this.updatedAt = Instant.now(); }
    public void setPhoneVerified(boolean v) { this.phoneVerified = v; this.updatedAt = Instant.now(); }
    public void setPhoneVerifiedAt(Instant v) { this.phoneVerifiedAt = v; this.updatedAt = Instant.now(); }
    public void setTwoFactorEnabled(boolean v) { this.twoFactorEnabled = v; this.updatedAt = Instant.now(); }
    public void setStatus(String v) { this.status = v; this.updatedAt = Instant.now(); }
    public void setUsername(String v) { this.username = v; this.updatedAt = Instant.now(); }
}
