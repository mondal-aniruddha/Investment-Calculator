package com.infinance.tax.dto;

import com.infinance.common.dto.MoneyAmount;

import java.math.BigDecimal;

public record SlabBreakdownItemDto(
        String slabRange,
        BigDecimal slabRatePercent,
        BigDecimal taxableAmountInSlab,
        BigDecimal taxForSlab,
        MoneyAmount taxableAmountFormatted,
        MoneyAmount taxForSlabFormatted
) {}
