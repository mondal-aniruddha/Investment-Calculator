package com.infinance.config_engine.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record TaxSlabUpsertRequest(
        @NotBlank @Size(max = 16) String financialYear,
        @NotBlank @Pattern(regexp = "OLD|NEW") String regime,
        @NotNull @Min(1) Integer slabOrder,
        @NotNull @DecimalMin("0") BigDecimal incomeFrom,
        @DecimalMin("0") BigDecimal incomeTo,
        @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal taxRatePercent
) {}
