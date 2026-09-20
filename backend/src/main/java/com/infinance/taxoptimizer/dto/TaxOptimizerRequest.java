package com.infinance.taxoptimizer.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record TaxOptimizerRequest(@NotNull @DecimalMin("0") BigDecimal grossSalary,
        @DecimalMin("0") BigDecimal section80C, @DecimalMin("0") BigDecimal section80DMedicalInsurance,
        @DecimalMin("0") BigDecimal section80CCD1BNps, String financialYear) {}
