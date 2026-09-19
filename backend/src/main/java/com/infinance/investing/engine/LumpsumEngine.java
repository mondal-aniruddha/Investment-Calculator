package com.infinance.investing.engine;

import com.infinance.common.dto.MoneyAmount;
import com.infinance.common.money.FinancialMath;
import com.infinance.investing.dto.YearlyGrowthDto;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure stateless engine for one-time lumpsum investment compounding.
 * Formula: FV = P * (1 + r)^n
 */
public final class LumpsumEngine {

    private static final MathContext MC = MathContext.DECIMAL128;
    private static final BigDecimal HUNDRED = new BigDecimal("100");

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

        BigDecimal r = annualReturnPercent.divide(HUNDRED, 10, RoundingMode.HALF_UP);
        BigDecimal onePlusR = BigDecimal.ONE.add(r);

        BigDecimal roundedPrincipal = principal.setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
        BigDecimal maturityCorpus = roundedPrincipal.multiply(onePlusR.pow(tenureYears, MC), MC)
                .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
        BigDecimal estimatedReturns = maturityCorpus.subtract(roundedPrincipal)
                .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

        List<YearlyGrowthDto> yearlyBreakdown = new ArrayList<>();
        for (int yr = 1; yr <= tenureYears; yr++) {
            BigDecimal yearCorpus = roundedPrincipal.multiply(onePlusR.pow(yr, MC), MC)
                    .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
            BigDecimal yearGain = yearCorpus.subtract(roundedPrincipal)
                    .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

            yearlyBreakdown.add(new YearlyGrowthDto(
                    yr,
                    roundedPrincipal,
                    yearCorpus,
                    yearGain,
                    MoneyAmount.of(roundedPrincipal),
                    MoneyAmount.of(yearCorpus)
            ));
        }

        return new LumpsumResult(roundedPrincipal, estimatedReturns, maturityCorpus, yearlyBreakdown);
    }
}
