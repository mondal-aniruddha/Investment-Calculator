package com.infinance.auth.dto;

import java.time.Instant;

public record ScenarioResponse(
    String id,
    String name,
    String scenarioType,
    Object payload,
    Instant createdAt,
    Instant updatedAt
) {}
