package com.infinance.auth.dto;

import java.util.List;

public record CompareResponse(
    List<ScenarioResponse> scenarios
) {}
