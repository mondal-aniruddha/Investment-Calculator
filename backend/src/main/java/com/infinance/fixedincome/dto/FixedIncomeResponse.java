package com.infinance.fixedincome.dto;

import com.infinance.common.dto.BaseAssumptionsDto;

import java.math.BigDecimal;

public record FixedIncomeResponse(
        String scheme,
        BigDecimal totalContribution,
        BigDecimal maturityValue,
        BigDecimal interestEarned,
        BigDecimal postTaxValue,
        BigDecimal inflationAdjustedValue,
        BigDecimal effectiveRealReturn,
        BaseAssumptionsDto assumptions
) {}
