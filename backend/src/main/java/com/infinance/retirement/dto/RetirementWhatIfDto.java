package com.infinance.retirement.dto;

import com.infinance.common.dto.MoneyAmount;

import java.math.BigDecimal;

public record RetirementWhatIfDto(
        String scenarioLabel,
        int targetRetirementAge,
        int deltaYears,
        BigDecimal requiredCorpus,
        BigDecimal additionalMonthlySavings,
        MoneyAmount requiredCorpusFormatted,
        MoneyAmount additionalMonthlySavingsFormatted
) {}
