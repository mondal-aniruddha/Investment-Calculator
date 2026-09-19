package com.infinance.common.dto;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Baseline and effective assumptions applied during a calculation.
 * Rendered in the UI so the user can inspect or override them.
 */
public record BaseAssumptionsDto(
        String financialYear,
        BigDecimal inflationRate,
        BigDecimal expectedEquityReturn,
        BigDecimal expectedDebtReturn,
        String statutoryDisclaimer,
        Map<String, Object> moduleSpecificAssumptions
) {}
