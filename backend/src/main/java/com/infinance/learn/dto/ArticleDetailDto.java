package com.infinance.learn.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Full article detail including Markdown body and source citations")
public record ArticleDetailDto(
    String id,
    String slug,
    String title,
    String excerpt,
    String category,
    String bodyMarkdown,
    Integer readingTimeMinutes,
    String relatedCalculatorPath,
    String relatedCalculatorLabel,
    String tags,
    String sources,
    LocalDateTime updatedAt,
    LocalDateTime createdAt
) {}
