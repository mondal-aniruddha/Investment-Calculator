package com.infinance.queries.dto;

import com.infinance.queries.entity.QueryStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateQueryStatusRequest(
        @NotNull(message = "Status is required")
        QueryStatus status
) {}
