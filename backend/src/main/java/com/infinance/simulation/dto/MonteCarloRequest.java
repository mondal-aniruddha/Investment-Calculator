package com.infinance.simulation.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record MonteCarloRequest(@NotNull @DecimalMin("0") BigDecimal initialCorpus,
        @NotNull @DecimalMin("0") BigDecimal monthlyContribution, @NotNull @Min(1) @Max(60) Integer years,
        @NotNull @DecimalMin("0") @DecimalMax("50") BigDecimal expectedAnnualReturn,
        @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal annualVolatility,
        @NotNull @DecimalMin("0") @DecimalMax("50") BigDecimal inflationRate,
        @NotNull @DecimalMin("1") BigDecimal targetCorpus,
        @Min(1000) @Max(10000) Integer runs, Long seed) {}
