package com.infinance.config_engine.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record AssumptionUpsertRequest(
        @NotBlank @Size(max = 32) String category,
        @NotBlank @Size(max = 64) String subKey,
        @NotNull @DecimalMin("0") BigDecimal numericalValue,
        @Size(max = 255) String textValue,
        @NotBlank @Size(max = 16) String financialYear,
        @Size(max = 500) String description,
        Boolean active
) {}
