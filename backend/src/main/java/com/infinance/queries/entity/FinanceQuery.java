package com.infinance.queries.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "finance_queries", indexes = {
        @Index(name = "idx_finance_queries_reference_id", columnList = "reference_id"),
        @Index(name = "idx_finance_queries_status", columnList = "status"),
        @Index(name = "idx_finance_queries_created_at", columnList = "created_at")
})
public class FinanceQuery {

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    @Column(name = "reference_id", length = 32, nullable = false, unique = true)
    private String referenceId;

    @Column(length = 80, nullable = false)
    private String name;

    @Column(length = 320, nullable = false)
    private String email;

    @Column(length = 32)
    private String whatsapp;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private QueryCategory category;

    @Column(length = 120, nullable = false)
    private String subject;

    @Column(length = 2500, nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_contact", length = 20, nullable = false)
    private PreferredContactMethod preferredContact;

    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    private QueryStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "client_ip_hash", length = 64, nullable = false)
    private String clientIpHash;

    protected FinanceQuery() {
    }

    public FinanceQuery(String referenceId, String name, String email, String whatsapp,
                        QueryCategory category, String subject, String message,
                        PreferredContactMethod preferredContact, String clientIpHash) {
        this.id = UUID.randomUUID().toString();
        this.referenceId = referenceId;
        this.name = name;
        this.email = email;
        this.whatsapp = whatsapp;
        this.category = category;
        this.subject = subject;
        this.message = message;
        this.preferredContact = preferredContact;
        this.status = QueryStatus.NEW;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
        this.clientIpHash = clientIpHash;
    }

    public String getId() {
        return id;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.updatedAt = Instant.now();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
        this.updatedAt = Instant.now();
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public void setWhatsapp(String whatsapp) {
        this.whatsapp = whatsapp;
        this.updatedAt = Instant.now();
    }

    public QueryCategory getCategory() {
        return category;
    }

    public void setCategory(QueryCategory category) {
        this.category = category;
        this.updatedAt = Instant.now();
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
        this.updatedAt = Instant.now();
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
        this.updatedAt = Instant.now();
    }

    public PreferredContactMethod getPreferredContact() {
        return preferredContact;
    }

    public void setPreferredContact(PreferredContactMethod preferredContact) {
        this.preferredContact = preferredContact;
        this.updatedAt = Instant.now();
    }

    public QueryStatus getStatus() {
        return status;
    }

    public void setStatus(QueryStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public String getClientIpHash() {
        return clientIpHash;
    }
}
