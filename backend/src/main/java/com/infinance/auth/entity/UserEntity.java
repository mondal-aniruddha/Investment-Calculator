package com.infinance.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "app_users")
public class UserEntity {
    @Id @Column(length = 36) private String id;
    @Column(nullable = false, unique = true, length = 320) private String email;
    @Column(name = "password_hash", nullable = false) private String passwordHash;
    @Column(name = "display_name", nullable = false, length = 120) private String displayName;
    @Column(length = 32) private String phone;
    @Column(length = 50, unique = true) private String username;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    protected UserEntity() {}
    public UserEntity(String email, String passwordHash, String displayName, String phone) {
        this(email, passwordHash, displayName, phone, null);
    }
    public UserEntity(String email, String passwordHash, String displayName, String phone, String username) {
        this.id = java.util.UUID.randomUUID().toString(); this.email = email; this.passwordHash = passwordHash;
        this.displayName = displayName; this.phone = phone; this.username = username;
        this.createdAt = Instant.now(); this.updatedAt = this.createdAt;
    }
    public String getId() { return id; } public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; } public String getDisplayName() { return displayName; }
    public String getPhone() { return phone; } public void setDisplayName(String v) { displayName = v; updatedAt = Instant.now(); }
    public String getUsername() { return username; } public void setUsername(String v) { username = v; updatedAt = Instant.now(); }
    public Instant getCreatedAt() { return createdAt; }
    public void setPhone(String v) { phone = v; updatedAt = Instant.now(); }
}
