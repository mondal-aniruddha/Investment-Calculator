package com.infinance.reports.dto;

import com.infinance.common.dto.BaseAssumptionsDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * The calculator response payload is deliberately map-shaped so a report can
 * contain the combined results of any current or future calculator.
 */
public record PersonalizedReportRequest(
        @NotBlank(message = "report title is required")
        String reportTitle,
        @NotBlank(message = "customer name is required")
        String customerName,
        @NotEmpty(message = "at least one calculator result is required")
        Map<String, Object> results,
        @NotNull(message = "assumptions are required")
        BaseAssumptionsDto assumptions
) {
}
