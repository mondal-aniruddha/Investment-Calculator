package com.infinance.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "saved_scenarios")
public class SavedScenarioEntity {
    @Id @Column(length = 36) private String id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private UserEntity user;
    @Column(nullable = false, length = 120) private String name;
    @Column(name = "scenario_type", nullable = false, length = 40) private String scenarioType;
    @Column(nullable = false, length = 1000000) private String payload;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    protected SavedScenarioEntity() {}
    public SavedScenarioEntity(UserEntity user, String name, String type, String payload) {
        this.id = java.util.UUID.randomUUID().toString(); this.user = user; this.name = name; this.scenarioType = type;
        this.payload = payload; this.createdAt = Instant.now(); this.updatedAt = createdAt;
    }
    public String getId() { return id; } public UserEntity getUser() { return user; }
    public String getName() { return name; } public String getScenarioType() { return scenarioType; }
    public String getPayload() { return payload; } public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void update(String name, String type, String payload) { this.name=name; this.scenarioType=type; this.payload=payload; this.updatedAt=Instant.now(); }
}
