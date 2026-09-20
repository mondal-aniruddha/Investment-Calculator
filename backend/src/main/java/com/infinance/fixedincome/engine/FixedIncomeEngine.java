package com.infinance.fixedincome.engine;

import com.infinance.common.money.FinancialMath;
import com.infinance.fixedincome.dto.FixedIncomeResponse;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Pure fixed-income projections.
 *
 * <p>FD/PPF-style maturity uses A = P(1+r)^n. RD-style maturity treats
 * the contribution as a monthly annuity due using the monthly rate.
 * Post-tax value subtracts taxRate percent of positive interest. Inflation
 * adjustment divides maturity by (1+inflation)^years.</p>
 */
public final class FixedIncomeEngine {
    private FixedIncomeEngine() {}
    public static FixedIncomeResponse calculate(String scheme, BigDecimal contribution, int years,
            BigDecimal annualRate, BigDecimal taxRate, BigDecimal inflationRate, boolean recurring) {
        BigDecimal rate = FinancialMath.percentToDecimalRate(annualRate);
        BigDecimal maturity;
        BigDecimal invested;
        if (recurring) {
            int months = years * 12;
            BigDecimal monthlyRate = rate.divide(FinancialMath.TWELVE, 12, RoundingMode.HALF_UP);
            invested = contribution.multiply(BigDecimal.valueOf(months));
            if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) maturity = invested;
            else maturity = contribution.multiply(BigDecimal.ONE.add(monthlyRate)
                    .pow(months, FinancialMath.MC_CALC).subtract(BigDecimal.ONE))
                    .divide(monthlyRate, FinancialMath.MC_CALC).multiply(BigDecimal.ONE.add(monthlyRate));
        } else {
            invested = contribution;
            maturity = contribution.multiply(BigDecimal.ONE.add(rate).pow(years, FinancialMath.MC_CALC));
        }
        BigDecimal interest = maturity.subtract(invested);
        BigDecimal postTax = maturity.subtract(interest.max(BigDecimal.ZERO)
                .multiply(taxRate).divide(FinancialMath.HUNDRED, FinancialMath.MC_CALC));
        BigDecimal realValue = maturity.divide(BigDecimal.ONE.add(FinancialMath.percentToDecimalRate(inflationRate))
                .pow(years, FinancialMath.MC_CALC), FinancialMath.MC_CALC);
        return new FixedIncomeResponse(scheme, round(invested), round(maturity), round(interest),
                round(postTax), round(realValue), FinancialMath.calculateRealRate(annualRate, inflationRate), null);
    }
    private static BigDecimal round(BigDecimal value) { return value.setScale(2, RoundingMode.HALF_UP); }
}
