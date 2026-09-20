package com.infinance.healthscore.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record HealthScoreRequest(
        @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal savingsRatePercent,
        @NotNull @DecimalMin("0") @DecimalMax("120") BigDecimal emergencyFundMonths,
        @NotNull @DecimalMin("0") @DecimalMax("200") BigDecimal debtToIncomePercent,
        @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal insuranceCoveragePercent,
        @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal creditUtilizationPercent,
        @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal retirementReadinessPercent
) {}
