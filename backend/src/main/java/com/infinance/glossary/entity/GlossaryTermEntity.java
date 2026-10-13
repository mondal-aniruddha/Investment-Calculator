package com.infinance.glossary.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "glossary_terms")
public class GlossaryTermEntity {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "term", length = 80, nullable = false, unique = true)
    private String term;

    @Column(name = "short_definition", length = 350, nullable = false)
    private String shortDefinition;

    @Column(name = "detailed_explainer", length = 100000)
    private String detailedExplainer;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "related_url", length = 120)
    private String relatedUrl;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public GlossaryTermEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTerm() { return term; }
    public void setTerm(String term) { this.term = term; }

    public String getShortDefinition() { return shortDefinition; }
    public void setShortDefinition(String shortDefinition) { this.shortDefinition = shortDefinition; }

    public String getDetailedExplainer() { return detailedExplainer; }
    public void setDetailedExplainer(String detailedExplainer) { this.detailedExplainer = detailedExplainer; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getRelatedUrl() { return relatedUrl; }
    public void setRelatedUrl(String relatedUrl) { this.relatedUrl = relatedUrl; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
