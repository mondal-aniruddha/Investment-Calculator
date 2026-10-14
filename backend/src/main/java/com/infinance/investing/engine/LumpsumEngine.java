package com.infinance.investing.engine;

import com.infinance.common.dto.MoneyAmount;
import com.infinance.common.engine.LumpsumCalculationEngine;
import com.infinance.investing.dto.YearlyGrowthDto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Pure stateless engine for one-time lumpsum investment compounding.
 * Delegates core compounding formula to {@link LumpsumCalculationEngine}.
 */
public final class LumpsumEngine {

    private LumpsumEngine() {}

    public record LumpsumResult(
            BigDecimal totalInvested,
            BigDecimal estimatedReturns,
            BigDecimal maturityCorpus,
            List<YearlyGrowthDto> yearlyBreakdown
    ) {}

    public static LumpsumResult calculate(
            BigDecimal principal,
            int tenureYears,
            BigDecimal annualReturnPercent) {

        var corpusResult = LumpsumCalculationEngine.calculateCorpus(principal, tenureYears, annualReturnPercent);
        var breakdownPoints = LumpsumCalculationEngine.calculateYearlyProgression(principal, tenureYears, annualReturnPercent);

        List<YearlyGrowthDto> yearlyBreakdown = breakdownPoints.stream()
                .map(p -> new YearlyGrowthDto(
                        p.year(),
                        p.investedCumulative(),
                        p.corpusExpected(),
                        p.returnsEarnedCumulative(),
                        MoneyAmount.of(p.investedCumulative()),
                        MoneyAmount.of(p.corpusExpected())
                ))
                .toList();

        return new LumpsumResult(corpusResult.totalInvested(), corpusResult.estimatedReturns(), corpusResult.maturityCorpus(), yearlyBreakdown);
    }
}
