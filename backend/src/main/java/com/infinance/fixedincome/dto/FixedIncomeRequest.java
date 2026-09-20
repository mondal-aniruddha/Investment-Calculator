package com.infinance.fixedincome.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record FixedIncomeRequest(
        @NotNull String scheme,
        @NotNull @DecimalMin("100.00") @DecimalMax("1000000000.00") BigDecimal contribution,
        @NotNull @Min(1) @Max(50) Integer tenureYears,
        @DecimalMin("0.00") @DecimalMax("50.00") BigDecimal annualRate,
        @DecimalMin("0.00") @DecimalMax("50.00") BigDecimal taxRate,
        @DecimalMin("0.00") @DecimalMax("50.00") BigDecimal inflationRate
) {}
