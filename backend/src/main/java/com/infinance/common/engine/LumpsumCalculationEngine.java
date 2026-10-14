package com.infinance.common.engine;

import com.infinance.common.money.FinancialMath;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure, shared mathematical calculation engine for one-time lumpsum investment compounding.
 * Formula: FV = P * (1 + r)^n
 */
public final class LumpsumCalculationEngine {

    private static final MathContext MC = MathContext.DECIMAL128;
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private LumpsumCalculationEngine() {}

    public record CorpusResult(
            BigDecimal totalInvested,
            BigDecimal estimatedReturns,
            BigDecimal maturityCorpus
    ) {}

    public record YearlyBreakdownPoint(
            int year,
            BigDecimal investedCumulative,
            BigDecimal corpusExpected,
            BigDecimal returnsEarnedCumulative
    ) {}

    public static CorpusResult calculateCorpus(
            BigDecimal principal,
            int tenureYears,
            BigDecimal annualReturnPercent) {

        BigDecimal r = annualReturnPercent.divide(HUNDRED, 10, RoundingMode.HALF_UP);
        BigDecimal onePlusR = BigDecimal.ONE.add(r);

        BigDecimal roundedPrincipal = principal.setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
        BigDecimal maturityCorpus = roundedPrincipal.multiply(onePlusR.pow(tenureYears, MC), MC)
                .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
        BigDecimal estimatedReturns = maturityCorpus.subtract(roundedPrincipal)
                .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

        return new CorpusResult(roundedPrincipal, estimatedReturns, maturityCorpus);
    }

    public static List<YearlyBreakdownPoint> calculateYearlyProgression(
            BigDecimal principal,
            int tenureYears,
            BigDecimal annualReturnPercent) {

        BigDecimal r = annualReturnPercent.divide(HUNDRED, 10, RoundingMode.HALF_UP);
        BigDecimal onePlusR = BigDecimal.ONE.add(r);
        BigDecimal roundedPrincipal = principal.setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

        List<YearlyBreakdownPoint> yearlyBreakdown = new ArrayList<>();
        for (int yr = 1; yr <= tenureYears; yr++) {
            BigDecimal yearCorpus = roundedPrincipal.multiply(onePlusR.pow(yr, MC), MC)
                    .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
            BigDecimal yearGain = yearCorpus.subtract(roundedPrincipal)
                    .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

            yearlyBreakdown.add(new YearlyBreakdownPoint(
                    yr,
                    roundedPrincipal,
                    yearCorpus,
                    yearGain
            ));
        }

        return yearlyBreakdown;
    }
}
