package com.infinance.common.money;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

/**
 * Pure stateless math utilities for financial calculations.
 * Avoids precision loss by using high-precision MathContext (DECIMAL128)
 * and rounding final monetary outputs to 2 decimal places with RoundingMode.HALF_UP.
 */
public final class FinancialMath {

    public static final MathContext MC_CALC = MathContext.DECIMAL128;
    public static final int MONEY_SCALE = 2;
    public static final RoundingMode MONEY_ROUNDING = RoundingMode.HALF_UP;

    public static final BigDecimal HUNDRED = new BigDecimal("100");
    public static final BigDecimal TWELVE = new BigDecimal("12");
    public static final BigDecimal ONE = BigDecimal.ONE;
    public static final BigDecimal ZERO = BigDecimal.ZERO;

    private FinancialMath() {
    }

    /**
     * Converts an annual percentage rate (e.g., 12.0) to monthly decimal rate (e.g., 0.01).
     */
    public static BigDecimal annualPercentToMonthlyRate(BigDecimal annualPercentage) {
        if (annualPercentage == null || annualPercentage.compareTo(ZERO) == 0) {
            return ZERO;
        }
        return annualPercentage.divide(HUNDRED, 12, MONEY_ROUNDING)
                .divide(TWELVE, 12, MONEY_ROUNDING);
    }

    /**
     * Converts an annual percentage (e.g., 6.0) to annual decimal rate (e.g., 0.06).
     */
    public static BigDecimal percentToDecimalRate(BigDecimal percentage) {
        if (percentage == null || percentage.compareTo(ZERO) == 0) {
            return ZERO;
        }
        return percentage.divide(HUNDRED, 10, MONEY_ROUNDING);
    }

    /**
     * Calculates (1 + r)^n with high precision.
     */
    public static BigDecimal compoundFactor(BigDecimal rate, int n) {
        if (n == 0) {
            return ONE;
        }
        BigDecimal base = ONE.add(rate);
        return base.pow(n, MC_CALC);
    }

    /**
     * Computes the real rate of return given nominal rate and inflation rate (Fisher equation):
     * r_real = (1 + r_nominal) / (1 + r_inflation) - 1
     */
    public static BigDecimal calculateRealRate(BigDecimal nominalRatePct, BigDecimal inflationRatePct) {
        BigDecimal nominalDec = percentToDecimalRate(nominalRatePct);
        BigDecimal inflationDec = percentToDecimalRate(inflationRatePct);

        BigDecimal numerator = ONE.add(nominalDec);
        BigDecimal denominator = ONE.add(inflationDec);

        BigDecimal realDec = numerator.divide(denominator, 10, MONEY_ROUNDING).subtract(ONE);
        return realDec.multiply(HUNDRED).setScale(2, MONEY_ROUNDING);
    }

    /**
     * Rounds monetary amount to standard 2 decimal places HALF_UP.
     */
    public static BigDecimal roundMoney(BigDecimal amount) {
        if (amount == null) {
            return ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING);
        }
        return amount.setScale(MONEY_SCALE, MONEY_ROUNDING);
    }
}
