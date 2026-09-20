package com.infinance.config_engine.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "assumption_audit")
public class AssumptionAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String entityType;
    private String entityId;
    private String action;
    private String actor;
    private Instant changedAt;
    @Column(length = 4000)
    private String payload;

    protected AssumptionAuditEntity() {}

    public AssumptionAuditEntity(String entityType, String entityId, String action, String actor, String payload) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.action = action;
        this.actor = actor;
        this.payload = payload;
        this.changedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getEntityType() { return entityType; }
    public String getEntityId() { return entityId; }
    public String getAction() { return action; }
    public String getActor() { return actor; }
    public Instant getChangedAt() { return changedAt; }
    public String getPayload() { return payload; }
}
