package com.infinance.auth.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CompareRequest(
    @NotEmpty @Size(min = 2, max = 5) List<String> scenarioIds
) {}
