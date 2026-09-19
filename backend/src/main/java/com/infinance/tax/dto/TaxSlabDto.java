package com.infinance.tax.dto;

import java.math.BigDecimal;

public record TaxSlabDto(
        int order,
        BigDecimal min,
        BigDecimal max,
        BigDecimal ratePercent,
        String displayRange
) {}
