package com.infinance.learn.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "learn_articles")
public class LearnArticleEntity {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "slug", length = 120, nullable = false, unique = true)
    private String slug;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "excerpt", length = 500, nullable = false)
    private String excerpt;

    @Column(name = "category", length = 50, nullable = false)
    private String category;

    @Column(name = "body_markdown", nullable = false, length = 1000000)
    private String bodyMarkdown;

    @Column(name = "reading_time_minutes", nullable = false)
    private Integer readingTimeMinutes;

    @Column(name = "related_calculator_path", length = 100)
    private String relatedCalculatorPath;

    @Column(name = "related_calculator_label", length = 100)
    private String relatedCalculatorLabel;

    @Column(name = "tags", length = 255)
    private String tags;

    @Column(name = "sources", length = 500)
    private String sources;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public LearnArticleEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBodyMarkdown() { return bodyMarkdown; }
    public void setBodyMarkdown(String bodyMarkdown) { this.bodyMarkdown = bodyMarkdown; }

    public Integer getReadingTimeMinutes() { return readingTimeMinutes; }
    public void setReadingTimeMinutes(Integer readingTimeMinutes) { this.readingTimeMinutes = readingTimeMinutes; }

    public String getRelatedCalculatorPath() { return relatedCalculatorPath; }
    public void setRelatedCalculatorPath(String relatedCalculatorPath) { this.relatedCalculatorPath = relatedCalculatorPath; }

    public String getRelatedCalculatorLabel() { return relatedCalculatorLabel; }
    public void setRelatedCalculatorLabel(String relatedCalculatorLabel) { this.relatedCalculatorLabel = relatedCalculatorLabel; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getSources() { return sources; }
    public void setSources(String sources) { this.sources = sources; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
