package com.infinance.mutualfund.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record SwpRequest(
        @NotNull @DecimalMin("100.00") BigDecimal initialCorpus,
        @NotNull @DecimalMin("0.00") @DecimalMax("50.00") BigDecimal annualReturn,
        @NotNull @DecimalMin("1.00") BigDecimal monthlyWithdrawal,
        @NotNull @Min(1) @Max(50) Integer tenureYears,
        @DecimalMin("0.00") @DecimalMax("50.00") BigDecimal annualWithdrawalIncrease
) {}
