package com.infinance.glossary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Financial glossary definition for inline tooltips and dictionary lookup")
public record GlossaryTermDto(
    String id,
    String term,
    String shortDefinition,
    String detailedExplainer,
    String category,
    String relatedUrl
) {}
