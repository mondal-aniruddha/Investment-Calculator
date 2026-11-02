package com.infinance.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "otp_challenges")
public class OtpChallengeEntity {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(nullable = false, length = 32)
    private String purpose;

    @Column(nullable = false, length = 16)
    private String channel;

    @Column(name = "destination_e164", nullable = false, length = 16)
    private String destinationE164;

    @Column(name = "code_hash", nullable = false, length = 128)
    private String codeHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private int attempts = 0;

    @Column(name = "send_count", nullable = false)
    private int sendCount = 1;

    @Column(name = "last_sent_at", nullable = false)
    private Instant lastSentAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected OtpChallengeEntity() {}

    public OtpChallengeEntity(
            String userId,
            String purpose,
            String channel,
            String destinationE164,
            String codeHash,
            Instant expiresAt
    ) {
        this.id = java.util.UUID.randomUUID().toString();
        this.userId = userId;
        this.purpose = purpose;
        this.channel = channel;
        this.destinationE164 = destinationE164;
        this.codeHash = codeHash;
        this.expiresAt = expiresAt;
        this.attempts = 0;
        this.sendCount = 1;
        this.lastSentAt = Instant.now();
        this.createdAt = this.lastSentAt;
    }

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getPurpose() { return purpose; }
    public String getChannel() { return channel; }
    public String getDestinationE164() { return destinationE164; }
    public String getCodeHash() { return codeHash; }
    public Instant getExpiresAt() { return expiresAt; }
    public int getAttempts() { return attempts; }
    public int getSendCount() { return sendCount; }
    public Instant getLastSentAt() { return lastSentAt; }
    public Instant getConsumedAt() { return consumedAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void setChannel(String channel) { this.channel = channel; }
    public void setCodeHash(String codeHash) { this.codeHash = codeHash; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
    public void incrementAttempts() { this.attempts++; }
    public void setSendCount(int sendCount) { this.sendCount = sendCount; }
    public void incrementSendCount() { this.sendCount++; }
    public void setLastSentAt(Instant lastSentAt) { this.lastSentAt = lastSentAt; }
    public void setConsumedAt(Instant consumedAt) { this.consumedAt = consumedAt; }
}

