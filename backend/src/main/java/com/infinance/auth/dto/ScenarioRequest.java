package com.infinance.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ScenarioRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Size(max = 40) String scenarioType,
    @NotNull Object payload
) {}
