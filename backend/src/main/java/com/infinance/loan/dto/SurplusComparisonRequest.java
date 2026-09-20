package com.infinance.loan.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SurplusComparisonRequest(
        @Valid @NotNull LoanPrepaymentRequest loan,
        @NotNull @DecimalMin("0.00") BigDecimal monthlySurplus,
        @NotNull @DecimalMin("0.00") @DecimalMax("50.00") BigDecimal sipAnnualReturn
) {}
