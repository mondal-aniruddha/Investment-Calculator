package com.infinance.ai.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record AiInsightRequest(@NotNull Map<String, Object> calculationResult) {}
