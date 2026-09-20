package com.infinance.loan.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record BalanceTransferRequest(
        @NotNull @DecimalMin("500.00") BigDecimal outstandingPrincipal,
        @NotNull @Min(1) @Max(40) Integer remainingTenureYears,
        @NotNull @DecimalMin("0.00") @DecimalMax("50.00") BigDecimal currentAnnualRate,
        @NotNull @DecimalMin("0.00") @DecimalMax("50.00") BigDecimal newAnnualRate,
        @NotNull @DecimalMin("0.00") @DecimalMax("20.00") BigDecimal processingFeePercent
) {}
