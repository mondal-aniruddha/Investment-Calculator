package com.infinance.investing.engine;

import com.infinance.common.dto.MoneyAmount;
import com.infinance.common.money.FinancialMath;
import com.infinance.investing.dto.AssetBucketDto;
import com.infinance.investing.dto.ScenarioCorpusDto;
import com.infinance.investing.dto.YearlyGrowthDto;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure, stateless calculation engine for Systematic Investment Plans (SIP).
 * Has zero framework dependencies for unit-testability and deterministic execution.
 *
 * <p>Mathematical Formulas:</p>
 * <ul>
 *   <li><b>Standard SIP Future Value (Annuity Due):</b>
 *       <br><code>FV = P * [((1 + i)^n - 1) / i] * (1 + i)</code>
 *       <br>where:
 *       <br><code>P</code> = Monthly installment amount
 *       <br><code>i</code> = Monthly interest rate = (Annual Rate / 100) / 12
 *       <br><code>n</code> = Total installments = Tenure (Years) * 12
 *   </li>
 *   <li><b>Step-Up SIP:</b>
 *       <br>Installment increases by <code>S%</code> annually.
 *       <br>For month <code>m in [1, n]</code>, investment <code>P(m)</code> compounds for <code>(n - m + 1)</code> months:
 *       <br><code>FV = Sum_{m=1}^{n} [ P(m) * (1 + i)^(n - m + 1) ]</code>
 *   </li>
 * </ul>
 */
public final class SipEngine {

    private static final MathContext MC = MathContext.DECIMAL128;
    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final BigDecimal TWELVE = new BigDecimal("12");

    public record SipCalculationResult(
            BigDecimal totalInvested,
            BigDecimal estimatedReturns,
            BigDecimal maturityCorpus,
            List<YearlyGrowthDto> yearlyBreakdown,
            ScenarioCorpusDto expectedScenario,
            ScenarioCorpusDto pessimisticScenario,
            ScenarioCorpusDto optimisticScenario
    ) {}

    /**
     * Executes the comprehensive SIP calculation including scenario analysis and yearly breakdown.
     */
    public static SipCalculationResult calculate(
            BigDecimal monthlyInvestment,
            int tenureYears,
            BigDecimal annualReturnPercent,
            BigDecimal annualStepUpPercent) {

        BigDecimal effectiveStepUp = (annualStepUpPercent != null && annualStepUpPercent.compareTo(BigDecimal.ZERO) > 0)
                ? annualStepUpPercent
                : BigDecimal.ZERO;

        // Base expected scenario
        EngineCorpusResult expected = calculateSingleCorpus(
                monthlyInvestment, tenureYears, annualReturnPercent, effectiveStepUp);

        // Pessimistic scenario (-3% p.a., floor at 1%)
        BigDecimal pessimisticRate = annualReturnPercent.subtract(new BigDecimal("3.00")).max(BigDecimal.ONE);
        EngineCorpusResult pessimistic = calculateSingleCorpus(
                monthlyInvestment, tenureYears, pessimisticRate, effectiveStepUp);

        // Optimistic scenario (+3% p.a., cap at 30%)
        BigDecimal optimisticRate = annualReturnPercent.add(new BigDecimal("3.00")).min(new BigDecimal("30.00"));
        EngineCorpusResult optimistic = calculateSingleCorpus(
                monthlyInvestment, tenureYears, optimisticRate, effectiveStepUp);

        // Yearly progress breakdown for chart
        List<YearlyGrowthDto> yearlyBreakdown = calculateYearlyProgression(
                monthlyInvestment, tenureYears, annualReturnPercent, effectiveStepUp);

        return new SipCalculationResult(
                expected.totalInvested(),
                expected.returnsEarned(),
                expected.maturityCorpus(),
                yearlyBreakdown,
                new ScenarioCorpusDto(
                        "Expected",
                        annualReturnPercent.setScale(2, RoundingMode.HALF_UP),
                        expected.maturityCorpus(),
                        expected.returnsEarned(),
                        MoneyAmount.of(expected.maturityCorpus()),
                        MoneyAmount.of(expected.returnsEarned())
                ),
                new ScenarioCorpusDto(
                        "Pessimistic (-3%)",
                        pessimisticRate.setScale(2, RoundingMode.HALF_UP),
                        pessimistic.maturityCorpus(),
                        pessimistic.returnsEarned(),
                        MoneyAmount.of(pessimistic.maturityCorpus()),
                        MoneyAmount.of(pessimistic.returnsEarned())
                ),
                new ScenarioCorpusDto(
                        "Optimistic (+3%)",
                        optimisticRate.setScale(2, RoundingMode.HALF_UP),
                        optimistic.maturityCorpus(),
                        optimistic.returnsEarned(),
                        MoneyAmount.of(optimistic.maturityCorpus()),
                        MoneyAmount.of(optimistic.returnsEarned())
                )
        );
    }

    public record EngineCorpusResult(
            BigDecimal totalInvested,
            BigDecimal returnsEarned,
            BigDecimal maturityCorpus
    ) {}

    /**
     * Calculates the future value corpus for a given rate and step-up.
     */
    public static EngineCorpusResult calculateSingleCorpus(
            BigDecimal monthlyInvestment,
            int tenureYears,
            BigDecimal annualReturnPercent,
            BigDecimal annualStepUpPercent) {

        int totalMonths = tenureYears * 12;
        BigDecimal monthlyRate = annualReturnPercent.divide(HUNDRED, 12, RoundingMode.HALF_UP)
                .divide(TWELVE, 12, RoundingMode.HALF_UP);

        if (annualStepUpPercent == null || annualStepUpPercent.compareTo(BigDecimal.ZERO) == 0) {
            // Standard Closed-Form SIP Formula: FV = P * [((1+i)^n - 1) / i] * (1+i)
            BigDecimal totalInvested = monthlyInvestment.multiply(BigDecimal.valueOf(totalMonths))
                    .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

            if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
                return new EngineCorpusResult(totalInvested, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), totalInvested);
            }

            BigDecimal onePlusRate = BigDecimal.ONE.add(monthlyRate);
            BigDecimal compoundFactor = onePlusRate.pow(totalMonths, MC);
            BigDecimal numerator = compoundFactor.subtract(BigDecimal.ONE);
            BigDecimal fv = monthlyInvestment.multiply(numerator, MC)
                    .divide(monthlyRate, MC)
                    .multiply(onePlusRate, MC)
                    .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

            BigDecimal returns = fv.subtract(totalInvested).setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
            return new EngineCorpusResult(totalInvested, returns, fv);
        } else {
            // Step-up Month-by-month compounding simulation
            BigDecimal totalInvested = BigDecimal.ZERO;
            BigDecimal totalCorpus = BigDecimal.ZERO;
            BigDecimal currentMonthlyP = monthlyInvestment;
            BigDecimal stepUpMultiplier = BigDecimal.ONE.add(
                    annualStepUpPercent.divide(HUNDRED, 10, RoundingMode.HALF_UP));

            for (int month = 1; month <= totalMonths; month++) {
                // Apply step-up at beginning of each 12-month boundary after year 1
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

            return new EngineCorpusResult(roundedInvested, roundedReturns, roundedCorpus);
        }
    }

    /**
     * Calculates year-by-year cumulative progression for charting.
     */
    private static List<YearlyGrowthDto> calculateYearlyProgression(
            BigDecimal monthlyInvestment,
            int tenureYears,
            BigDecimal annualReturnPercent,
            BigDecimal annualStepUpPercent) {

        List<YearlyGrowthDto> progression = new ArrayList<>();
        BigDecimal monthlyRate = annualReturnPercent.divide(HUNDRED, 12, RoundingMode.HALF_UP)
                .divide(TWELVE, 12, RoundingMode.HALF_UP);
        BigDecimal stepUpMultiplier = BigDecimal.ONE.add(
                annualStepUpPercent.divide(HUNDRED, 10, RoundingMode.HALF_UP));

        // Precompute monthly investments
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

            progression.add(new YearlyGrowthDto(
                    yr,
                    roundedInvested,
                    roundedCorpus,
                    roundedGain,
                    MoneyAmount.of(roundedInvested),
                    MoneyAmount.of(roundedCorpus)
            ));
        }

        return progression;
    }

    /**
     * Generates illustrative asset allocation based on investor risk profile.
     */
    public static List<AssetBucketDto> getAssetAllocation(String riskProfile) {
        String profile = (riskProfile == null) ? "MODERATE" : riskProfile.toUpperCase();

        return switch (profile) {
            case "LOW" -> List.of(
                    new AssetBucketDto("Debt Mutual Funds & Arbitrage", 50, "Capital preservation with lower volatility than equities", List.of("Short Duration Funds", "Banking & PSU Debt", "Arbitrage Funds")),
                    new AssetBucketDto("Index & Large-Cap Equity", 20, "Long-term wealth creation beating inflation", List.of("Nifty 50 Index Direct-Growth", "Nifty Next 50")),
                    new AssetBucketDto("Fixed Income (PPF / RD / FD)", 20, "Guaranteed sovereign-backed return", List.of("Public Provident Fund (PPF)", "Bank Recurring Deposit")),
                    new AssetBucketDto("Sovereign Gold / Gold ETF", 10, "Macro hedge against currency depreciation", List.of("Gold ETFs", "Sovereign Gold Bonds"))
            );
            case "AGGRESSIVE" -> List.of(
                    new AssetBucketDto("Broad Market Equity Index Funds", 45, "Core wealth generation compounding engine", List.of("Nifty 50 Index Fund", "Nifty 500 Index Fund")),
                    new AssetBucketDto("Mid & Small Cap Equity Funds", 30, "Higher alpha potential over 10+ year horizons", List.of("Nifty Midcap 150 Index", "Small Cap Active Funds")),
                    new AssetBucketDto("High Quality Debt & Liquid Buffer", 15, "Emergency liquidity and portfolio rebalancing cushion", List.of("Liquid Funds", "Money Market Funds")),
                    new AssetBucketDto("Gold / Multi-Asset Hedge", 10, "Non-correlated defensive asset class", List.of("Gold ETFs"))
            );
            default -> List.of( // MODERATE
                    new AssetBucketDto("Large & Midcap Index Funds", 55, "Balanced market exposure with robust corporate balance sheets", List.of("Nifty 50 Index", "Nifty LargeMidcap 250 Index")),
                    new AssetBucketDto("Short Duration Debt Funds", 25, "Stability and downside protection during equity corrections", List.of("Corporate Bond Funds", "Target Maturity Debt Funds")),
                    new AssetBucketDto("Gold / Precious Metals", 10, "Hedge against inflation spikes and geopolitical volatility", List.of("Gold ETFs")),
                    new AssetBucketDto("International / Thematic Equity", 10, "Geographic diversification outside Indian Rupee assets", List.of("S&P 500 Index Feeder Funds"))
            );
        };
    }

    /**
     * Educational guidance steps for Indian retail investors starting out.
     */
    public static List<String> getBeginnerGuidance() {
        return List.of(
                "Complete Central KYC (CKYC) once using your PAN and Aadhaar (paperless online via DigiLocker).",
                "Always choose 'Direct - Growth' plans over 'Regular' plans. Direct plans avoid distributor commissions, adding 1.0% to 1.5% extra compounded returns every single year.",
                "Automate your SIP mandate (via UPI AutoPay or e-NACH) for 1-2 days after your monthly salary credit date.",
                "Avoid timing the market. Rupee-cost averaging automatically acquires more units when market prices dip.",
                "Revisit your SIP every year and consider a 10% annual Step-Up to match your career salary increments."
        );
    }
}
