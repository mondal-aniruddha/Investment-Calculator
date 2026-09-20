package com.infinance.sensitivity.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record SensitivityRequest(@NotNull @DecimalMin("100") BigDecimal monthlyInvestment,
        @NotNull @Min(1) @Max(50) Integer years, @NotNull @DecimalMin("0") @DecimalMax("50") BigDecimal expectedReturn,
        @NotNull @DecimalMin("0") @DecimalMax("50") BigDecimal inflationRate,
        @DecimalMin("0") BigDecimal contributionDelta, @DecimalMin("0") BigDecimal returnDelta, @DecimalMin("0") BigDecimal inflationDelta) {}
