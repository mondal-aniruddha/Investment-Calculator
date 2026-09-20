package com.infinance.loan.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record LoanPrepaymentRequest(
        @NotNull @DecimalMin("500.00") BigDecimal principal,
        @NotNull @Min(1) @Max(40) Integer tenureYears,
        @NotNull @DecimalMin("0.00") @DecimalMax("50.00") BigDecimal annualInterestRate,
        @NotNull @Min(1) Integer prepaymentMonth,
        @NotNull @DecimalMin("0.00") BigDecimal partPayment
) {}
