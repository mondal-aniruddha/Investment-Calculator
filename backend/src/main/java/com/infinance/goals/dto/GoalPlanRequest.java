package com.infinance.goals.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record GoalPlanRequest(
        @NotEmpty List<@Valid Goal> goals,
        @NotNull @DecimalMin("0.00") BigDecimal availableMonthlySavings
) {
    public record Goal(
            @NotBlank String name,
            @NotNull @DecimalMin("1.00") BigDecimal targetAmount,
            @NotNull @Min(1) @Max(600) Integer monthsUntilGoal,
            @NotNull @Min(1) @Max(10) Integer priority,
            @DecimalMin("0.00") @DecimalMax("50.00") BigDecimal expectedAnnualReturn,
            @DecimalMin("0.00") BigDecimal currentSavings
    ) {}
}
