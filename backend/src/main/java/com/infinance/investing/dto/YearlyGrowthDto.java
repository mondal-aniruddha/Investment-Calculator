package com.infinance.investing.dto;

import com.infinance.common.dto.MoneyAmount;

import java.math.BigDecimal;

public record YearlyGrowthDto(
        int year,
        BigDecimal investedCumulative,
        BigDecimal corpusExpected,
        BigDecimal returnsEarnedCumulative,
        MoneyAmount investedFormatted,
        MoneyAmount corpusFormatted
) {}
