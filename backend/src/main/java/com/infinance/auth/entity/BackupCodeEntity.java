package com.infinance.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_backup_codes")
public class BackupCodeEntity {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "code_hash", nullable = false, length = 128)
    private String codeHash;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected BackupCodeEntity() {}

    public BackupCodeEntity(String userId, String codeHash) {
        this.id = java.util.UUID.randomUUID().toString();
        this.userId = userId;
        this.codeHash = codeHash;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getCodeHash() { return codeHash; }
    public Instant getUsedAt() { return usedAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void setUsedAt(Instant usedAt) { this.usedAt = usedAt; }
}

