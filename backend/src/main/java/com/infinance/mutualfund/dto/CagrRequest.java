package com.infinance.mutualfund.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CagrRequest(
        @NotNull @DecimalMin("0.01") BigDecimal initialValue,
        @NotNull @DecimalMin("0.01") BigDecimal finalValue,
        @NotNull @DecimalMin("0.01") BigDecimal tenureYears
) {}
