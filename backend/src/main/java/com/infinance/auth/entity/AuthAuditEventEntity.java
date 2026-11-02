package com.infinance.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "auth_audit_events")
public class AuthAuditEventEntity {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "destination_masked", length = 32)
    private String destinationMasked;

    @Column(length = 255)
    private String details;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected AuthAuditEventEntity() {}

    public AuthAuditEventEntity(String userId, String eventType, String destinationMasked, String details) {
        this.id = java.util.UUID.randomUUID().toString();
        this.userId = userId;
        this.eventType = eventType;
        this.destinationMasked = destinationMasked;
        this.details = details;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getEventType() { return eventType; }
    public String getDestinationMasked() { return destinationMasked; }
    public String getDetails() { return details; }
    public Instant getCreatedAt() { return createdAt; }
}

