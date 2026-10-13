package com.infinance.learn.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Summary representation of a learning article for card listing")
public record ArticleSummaryDto(
    String id,
    String slug,
    String title,
    String excerpt,
    String category,
    Integer readingTimeMinutes,
    String relatedCalculatorPath,
    String relatedCalculatorLabel,
    String tags,
    LocalDateTime updatedAt
) {}
