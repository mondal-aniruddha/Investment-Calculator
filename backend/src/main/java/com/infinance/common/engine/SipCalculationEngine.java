package com.infinance.common.engine;

import com.infinance.common.money.FinancialMath;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure, shared mathematical calculation engine for Systematic Investment Plans (SIP).
 * Zero framework dependencies for deterministic financial calculations.
 */
public final class SipCalculationEngine {

    private static final MathContext MC = MathContext.DECIMAL128;
    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final BigDecimal TWELVE = new BigDecimal("12");

    private SipCalculationEngine() {}

    public record CorpusResult(
            BigDecimal totalInvested,
            BigDecimal returnsEarned,
            BigDecimal maturityCorpus
    ) {}

    public record YearlyBreakdownPoint(
            int year,
            BigDecimal investedCumulative,
            BigDecimal corpusExpected,
            BigDecimal returnsEarnedCumulative
    ) {}

    /**
     * Calculates the future value corpus for a given rate and step-up.
     */
    public static CorpusResult calculateCorpus(
            BigDecimal monthlyInvestment,
            int tenureYears,
            BigDecimal annualReturnPercent,
            BigDecimal annualStepUpPercent) {

        int totalMonths = tenureYears * 12;
        BigDecimal monthlyRate = annualReturnPercent.divide(HUNDRED, 12, RoundingMode.HALF_UP)
                .divide(TWELVE, 12, RoundingMode.HALF_UP);

        if (annualStepUpPercent == null || annualStepUpPercent.compareTo(BigDecimal.ZERO) == 0) {
            BigDecimal totalInvested = monthlyInvestment.multiply(BigDecimal.valueOf(totalMonths))
                    .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

            if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
                return new CorpusResult(totalInvested, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), totalInvested);
            }

            BigDecimal onePlusRate = BigDecimal.ONE.add(monthlyRate);
            BigDecimal compoundFactor = onePlusRate.pow(totalMonths, MC);
            BigDecimal numerator = compoundFactor.subtract(BigDecimal.ONE);
            BigDecimal fv = monthlyInvestment.multiply(numerator, MC)
                    .divide(monthlyRate, MC)
                    .multiply(onePlusRate, MC)
                    .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

            BigDecimal returns = fv.subtract(totalInvested).setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
            return new CorpusResult(totalInvested, returns, fv);
        } else {
            BigDecimal totalInvested = BigDecimal.ZERO;
            BigDecimal totalCorpus = BigDecimal.ZERO;
            BigDecimal currentMonthlyP = monthlyInvestment;
            BigDecimal stepUpMultiplier = BigDecimal.ONE.add(
                    annualStepUpPercent.divide(HUNDRED, 10, RoundingMode.HALF_UP));

            for (int month = 1; month <= totalMonths; month++) {
                if (month > 1 && (month - 1) % 12 == 0) {
                    currentMonthlyP = currentMonthlyP.multiply(stepUpMultiplier, MC);
                }

                totalInvested = totalInvested.add(currentMonthlyP);
                int monthsCompounding = totalMonths - month + 1;

                if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
                    totalCorpus = totalCorpus.add(currentMonthlyP);
                } else {
                    BigDecimal factor = BigDecimal.ONE.add(monthlyRate).pow(monthsCompounding, MC);
                    totalCorpus = totalCorpus.add(currentMonthlyP.multiply(factor, MC));
                }
            }

            BigDecimal roundedInvested = totalInvested.setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
            BigDecimal roundedCorpus = totalCorpus.setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
            BigDecimal roundedReturns = roundedCorpus.subtract(roundedInvested).setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

            return new CorpusResult(roundedInvested, roundedReturns, roundedCorpus);
        }
    }

    /**
     * Calculates year-by-year cumulative progression for charting.
     */
    public static List<YearlyBreakdownPoint> calculateYearlyProgression(
            BigDecimal monthlyInvestment,
            int tenureYears,
            BigDecimal annualReturnPercent,
            BigDecimal annualStepUpPercent) {

        List<YearlyBreakdownPoint> progression = new ArrayList<>();
        BigDecimal monthlyRate = annualReturnPercent.divide(HUNDRED, 12, RoundingMode.HALF_UP)
                .divide(TWELVE, 12, RoundingMode.HALF_UP);
        BigDecimal stepUpMultiplier = BigDecimal.ONE.add(
                annualStepUpPercent.divide(HUNDRED, 10, RoundingMode.HALF_UP));

        int totalMonths = tenureYears * 12;
        BigDecimal[] monthlyPayments = new BigDecimal[totalMonths];
        BigDecimal currentP = monthlyInvestment;

        for (int m = 0; m < totalMonths; m++) {
            if (m > 0 && m % 12 == 0) {
                currentP = currentP.multiply(stepUpMultiplier, MC);
            }
            monthlyPayments[m] = currentP;
        }

        for (int yr = 1; yr <= tenureYears; yr++) {
            int elapsedMonths = yr * 12;
            BigDecimal cumInvested = BigDecimal.ZERO;
            BigDecimal corpusAtYear = BigDecimal.ZERO;

            for (int m = 0; m < elapsedMonths; m++) {
                BigDecimal payment = monthlyPayments[m];
                cumInvested = cumInvested.add(payment);
                int monthsRemainingInYear = elapsedMonths - m;

                if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
                    corpusAtYear = corpusAtYear.add(payment);
                } else {
                    BigDecimal factor = BigDecimal.ONE.add(monthlyRate).pow(monthsRemainingInYear, MC);
                    corpusAtYear = corpusAtYear.add(payment.multiply(factor, MC));
                }
            }

            BigDecimal roundedInvested = cumInvested.setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
            BigDecimal roundedCorpus = corpusAtYear.setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
            BigDecimal roundedGain = roundedCorpus.subtract(roundedInvested).setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

            progression.add(new YearlyBreakdownPoint(
                    yr,
                    roundedInvested,
                    roundedCorpus,
                    roundedGain
            ));
        }

        return progression;
    }
}
