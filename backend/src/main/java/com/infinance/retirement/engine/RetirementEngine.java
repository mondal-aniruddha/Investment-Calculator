package com.infinance.retirement.engine;

import com.infinance.common.dto.MoneyAmount;
import com.infinance.common.exception.InvalidFinancialInputException;
import com.infinance.common.money.FinancialMath;
import com.infinance.investing.engine.SipEngine;
import com.infinance.retirement.dto.AgeTrajectoryDto;
import com.infinance.retirement.dto.RetirementWhatIfDto;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure stateless engine for Indian retirement planning calculations.
 *
 * <p>Mathematical Formulas:</p>
 * <ul>
 *   <li><b>Inflated Monthly Expenses:</b>
 *       <code>E_ret = E_0 * (1 + r_inf)^Y_acc</code>
 *   </li>
 *   <li><b>Post-Retirement Required Corpus (Inflation-Indexed Annuity Due):</b>
 *       Let <code>v = (1 + r_inf) / (1 + r_post)</code>.
 *       <br><code>Corpus = AnnualExpense_ret * [ (1 - v^Y_ret) / (1 - v) ]</code> (when <code>v != 1</code>)
 *       <br><code>Corpus = AnnualExpense_ret * Y_ret</code> (when <code>v == 1</code>)
 *   </li>
 *   <li><b>Additional SIP to Bridge Corpus Gap:</b>
 *       <code>Monthly SIP = Gap / [ ((1 + i)^n - 1) / i * (1 + i) ]</code>
 *   </li>
 * </ul>
 */
public final class RetirementEngine {

    private static final MathContext MC = MathContext.DECIMAL128;
    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final BigDecimal TWELVE = new BigDecimal("12");

    private RetirementEngine() {
    }

    public record RetirementEngineResult(
            int yearsToRetirement,
            int retirementDurationYears,
            BigDecimal monthlyExpenseAtRetirement,
            BigDecimal annualExpenseAtRetirement,
            BigDecimal requiredCorpusAtRetirement,
            BigDecimal projectedCorpusFromExistingSavings,
            BigDecimal shortfallOrSurplus,
            boolean isGoalAchieved,
            BigDecimal additionalMonthlySipRequired,
            List<AgeTrajectoryDto> ageTrajectory,
            List<RetirementWhatIfDto> whatIfScenarios
    ) {}

    public static RetirementEngineResult calculate(
            int currentAge,
            int targetRetirementAge,
            int lifeExpectancy,
            BigDecimal currentMonthlyExpenses,
            BigDecimal existingRetirementCorpus,
            BigDecimal currentMonthlyContribution,
            BigDecimal expectedReturnPreRetirement,
            BigDecimal expectedReturnPostRetirement,
            BigDecimal expectedInflationRate,
            BigDecimal annualStepUpPercent) {

        RetirementCoreResult core = calculateCore(
                currentAge, targetRetirementAge, lifeExpectancy,
                currentMonthlyExpenses, existingRetirementCorpus, currentMonthlyContribution,
                expectedReturnPreRetirement, expectedReturnPostRetirement, expectedInflationRate,
                annualStepUpPercent);

        List<RetirementWhatIfDto> whatIfs = buildWhatIfScenarios(
                currentAge, targetRetirementAge, lifeExpectancy,
                currentMonthlyExpenses, existingRetirementCorpus, currentMonthlyContribution,
                expectedReturnPreRetirement, expectedReturnPostRetirement, expectedInflationRate,
                annualStepUpPercent);

        return new RetirementEngineResult(
                core.yearsToRetirement(),
                core.retirementDurationYears(),
                core.monthlyExpenseAtRetirement(),
                core.annualExpenseAtRetirement(),
                core.requiredCorpusAtRetirement(),
                core.projectedCorpusFromExistingSavings(),
                core.shortfallOrSurplus(),
                core.isGoalAchieved(),
                core.additionalMonthlySipRequired(),
                core.ageTrajectory(),
                whatIfs
        );
    }

    public record RetirementCoreResult(
            int yearsToRetirement,
            int retirementDurationYears,
            BigDecimal monthlyExpenseAtRetirement,
            BigDecimal annualExpenseAtRetirement,
            BigDecimal requiredCorpusAtRetirement,
            BigDecimal projectedCorpusFromExistingSavings,
            BigDecimal shortfallOrSurplus,
            boolean isGoalAchieved,
            BigDecimal additionalMonthlySipRequired,
            List<AgeTrajectoryDto> ageTrajectory
    ) {}

    public static RetirementCoreResult calculateCore(
            int currentAge,
            int targetRetirementAge,
            int lifeExpectancy,
            BigDecimal currentMonthlyExpenses,
            BigDecimal existingRetirementCorpus,
            BigDecimal currentMonthlyContribution,
            BigDecimal expectedReturnPreRetirement,
            BigDecimal expectedReturnPostRetirement,
            BigDecimal expectedInflationRate,
            BigDecimal annualStepUpPercent) {

        if (targetRetirementAge <= currentAge) {
            throw new InvalidFinancialInputException(
                    "RETIREMENT_AGE_INVALID",
                    "Target retirement age (" + targetRetirementAge + ") must be greater than current age (" + currentAge + ")");
        }
        if (lifeExpectancy <= targetRetirementAge) {
            throw new InvalidFinancialInputException(
                    "LIFE_EXPECTANCY_INVALID",
                    "Life expectancy (" + lifeExpectancy + ") must be greater than target retirement age (" + targetRetirementAge + ")");
        }

        int yearsToRetirement = targetRetirementAge - currentAge;
        int retirementDurationYears = lifeExpectancy - targetRetirementAge;

        BigDecimal rInf = expectedInflationRate.divide(HUNDRED, 10, RoundingMode.HALF_UP);
        BigDecimal rPre = expectedReturnPreRetirement.divide(HUNDRED, 10, RoundingMode.HALF_UP);
        BigDecimal rPost = expectedReturnPostRetirement.divide(HUNDRED, 10, RoundingMode.HALF_UP);

        // 1. Inflated monthly and annual expenses at retirement year
        BigDecimal inflationFactor = BigDecimal.ONE.add(rInf).pow(yearsToRetirement, MC);
        BigDecimal monthlyExpenseAtRetirement = currentMonthlyExpenses.multiply(inflationFactor, MC)
                .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
        BigDecimal annualExpenseAtRetirement = monthlyExpenseAtRetirement.multiply(TWELVE)
                .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

        // 2. Required corpus at retirement (annuity-due with inflation)
        BigDecimal requiredCorpus = calculateRequiredCorpus(
                annualExpenseAtRetirement, retirementDurationYears, rInf, rPost);

        // 3. Projected corpus from existing savings + current monthly investments
        BigDecimal existingCorpusGrowth = existingRetirementCorpus.multiply(
                BigDecimal.ONE.add(rPre).pow(yearsToRetirement, MC), MC);

        BigDecimal ongoingSipCorpus = BigDecimal.ZERO;
        if (currentMonthlyContribution != null && currentMonthlyContribution.compareTo(BigDecimal.ZERO) > 0) {
            ongoingSipCorpus = SipEngine.calculateSingleCorpus(
                    currentMonthlyContribution,
                    yearsToRetirement,
                    expectedReturnPreRetirement,
                    annualStepUpPercent
            ).maturityCorpus();
        }

        BigDecimal projectedCorpus = existingCorpusGrowth.add(ongoingSipCorpus)
                .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

        // 4. Gap and required additional SIP
        BigDecimal gap = requiredCorpus.subtract(projectedCorpus);
        boolean isGoalAchieved = gap.compareTo(BigDecimal.ZERO) <= 0;
        BigDecimal additionalMonthlySip = BigDecimal.ZERO;

        if (!isGoalAchieved) {
            additionalMonthlySip = calculateAdditionalSip(gap, yearsToRetirement, expectedReturnPreRetirement);
        }

        // 5. Build age trajectory
        List<AgeTrajectoryDto> trajectory = buildTrajectory(
                currentAge, targetRetirementAge, lifeExpectancy,
                existingRetirementCorpus, currentMonthlyContribution, annualStepUpPercent,
                annualExpenseAtRetirement, rPre, rPost, rInf);

        return new RetirementCoreResult(
                yearsToRetirement,
                retirementDurationYears,
                monthlyExpenseAtRetirement,
                annualExpenseAtRetirement,
                requiredCorpus,
                projectedCorpus,
                gap.setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP),
                isGoalAchieved,
                additionalMonthlySip,
                trajectory
        );
    }

    /**
     * Calculates required corpus for retirement duration using the ratio v = (1 + r_inf) / (1 + r_post).
     */
    public static BigDecimal calculateRequiredCorpus(
            BigDecimal annualExpenseAtRetirement,
            int retirementDurationYears,
            BigDecimal rInf,
            BigDecimal rPost) {

        BigDecimal numeratorBase = BigDecimal.ONE.add(rInf);
        BigDecimal denominatorBase = BigDecimal.ONE.add(rPost);
        BigDecimal v = numeratorBase.divide(denominatorBase, 12, RoundingMode.HALF_UP);

        BigDecimal corpus;
        if (v.compareTo(BigDecimal.ONE) == 0) {
            corpus = annualExpenseAtRetirement.multiply(BigDecimal.valueOf(retirementDurationYears));
        } else {
            BigDecimal vPowN = v.pow(retirementDurationYears, MC);
            BigDecimal oneMinusVn = BigDecimal.ONE.subtract(vPowN);
            BigDecimal oneMinusV = BigDecimal.ONE.subtract(v);
            corpus = annualExpenseAtRetirement.multiply(oneMinusVn, MC).divide(oneMinusV, MC);
        }

        return corpus.setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
    }

    private static BigDecimal calculateAdditionalSip(
            BigDecimal gap,
            int yearsToRetirement,
            BigDecimal annualReturnPercent) {

        int totalMonths = yearsToRetirement * 12;
        BigDecimal monthlyRate = annualReturnPercent.divide(HUNDRED, 12, RoundingMode.HALF_UP)
                .divide(TWELVE, 12, RoundingMode.HALF_UP);

        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            return gap.divide(BigDecimal.valueOf(totalMonths), 2, RoundingMode.HALF_UP);
        }

        BigDecimal onePlusRate = BigDecimal.ONE.add(monthlyRate);
        BigDecimal compoundFactor = onePlusRate.pow(totalMonths, MC);
        BigDecimal numerator = compoundFactor.subtract(BigDecimal.ONE);
        BigDecimal sipMultiplier = numerator.divide(monthlyRate, MC).multiply(onePlusRate, MC);

        return gap.divide(sipMultiplier, 2, RoundingMode.HALF_UP);
    }

    private static List<AgeTrajectoryDto> buildTrajectory(
            int currentAge, int targetRetirementAge, int lifeExpectancy,
            BigDecimal existingCorpus, BigDecimal monthlyContribution, BigDecimal stepUpPercent,
            BigDecimal baseRetirementAnnualExpense, BigDecimal rPre, BigDecimal rPost, BigDecimal rInf) {

        List<AgeTrajectoryDto> list = new ArrayList<>();
        BigDecimal currentCorpus = existingCorpus;
        BigDecimal curMonthlyP = monthlyContribution != null ? monthlyContribution : BigDecimal.ZERO;
        BigDecimal stepUpFactor = BigDecimal.ONE.add(
                (stepUpPercent != null ? stepUpPercent : BigDecimal.ZERO).divide(HUNDRED, 10, RoundingMode.HALF_UP));

        // Accumulation Phase
        for (int age = currentAge; age < targetRetirementAge; age++) {
            BigDecimal startCorpus = currentCorpus;
            BigDecimal annualContribution = curMonthlyP.multiply(TWELVE);

            // Mid-year approximation of investment growth
            BigDecimal interestOnStart = startCorpus.multiply(rPre, MC);
            BigDecimal interestOnContribution = annualContribution.multiply(rPre, MC).divide(new BigDecimal("2"), MC);
            BigDecimal interestEarned = interestOnStart.add(interestOnContribution);

            BigDecimal endCorpus = startCorpus.add(annualContribution).add(interestEarned)
                    .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

            list.add(new AgeTrajectoryDto(
                    age,
                    "ACCUMULATION",
                    startCorpus.setScale(2, RoundingMode.HALF_UP),
                    annualContribution.setScale(2, RoundingMode.HALF_UP),
                    interestEarned.setScale(2, RoundingMode.HALF_UP),
                    endCorpus,
                    MoneyAmount.of(startCorpus),
                    MoneyAmount.of(endCorpus)
            ));

            currentCorpus = endCorpus;
            curMonthlyP = curMonthlyP.multiply(stepUpFactor, MC);
        }

        // Post-Retirement Depletion Phase
        BigDecimal currentAnnualExpense = baseRetirementAnnualExpense;
        for (int age = targetRetirementAge; age <= lifeExpectancy; age++) {
            BigDecimal startCorpus = currentCorpus;
            BigDecimal withdrawal = currentAnnualExpense.min(startCorpus); // Withdraw at start of year
            BigDecimal remainingCorpus = startCorpus.subtract(withdrawal).max(BigDecimal.ZERO);
            BigDecimal interestEarned = remainingCorpus.multiply(rPost, MC)
                    .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

            BigDecimal endCorpus = remainingCorpus.add(interestEarned)
                    .setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);

            list.add(new AgeTrajectoryDto(
                    age,
                    "RETIREMENT",
                    startCorpus.setScale(2, RoundingMode.HALF_UP),
                    withdrawal.negate().setScale(2, RoundingMode.HALF_UP), // negative indicates outflow
                    interestEarned,
                    endCorpus,
                    MoneyAmount.of(startCorpus),
                    MoneyAmount.of(endCorpus)
            ));

            currentCorpus = endCorpus;
            currentAnnualExpense = currentAnnualExpense.multiply(BigDecimal.ONE.add(rInf), MC);
        }

        return list;
    }

    private static List<RetirementWhatIfDto> buildWhatIfScenarios(
            int currentAge, int baseTargetAge, int lifeExpectancy,
            BigDecimal monthlyExpenses, BigDecimal existingCorpus, BigDecimal monthlyContribution,
            BigDecimal rPre, BigDecimal rPost, BigDecimal rInf, BigDecimal stepUp) {

        int[] deltas = {-3, 2, 5};
        List<RetirementWhatIfDto> scenarios = new ArrayList<>();

        for (int delta : deltas) {
            int scenarioAge = baseTargetAge + delta;
            if (scenarioAge <= currentAge || scenarioAge >= lifeExpectancy) {
                continue;
            }

            try {
                RetirementCoreResult res = calculateCore(
                        currentAge, scenarioAge, lifeExpectancy,
                        monthlyExpenses, existingCorpus, monthlyContribution,
                        rPre, rPost, rInf, stepUp);

                String label = delta < 0
                        ? "Retire " + Math.abs(delta) + " Years Earlier (Age " + scenarioAge + ")"
                        : "Work " + delta + " Years Longer (Age " + scenarioAge + ")";

                scenarios.add(new RetirementWhatIfDto(
                        label,
                        scenarioAge,
                        delta,
                        res.requiredCorpusAtRetirement(),
                        res.additionalMonthlySipRequired(),
                        MoneyAmount.of(res.requiredCorpusAtRetirement()),
                        MoneyAmount.of(res.additionalMonthlySipRequired())
                ));
            } catch (Exception ignored) {
            }
        }

        return scenarios;
    }

    public static List<String> getRetirementInsights() {
        return List.of(
                "Inflation Impact: An inflation rate of 6% doubles living expenses roughly every 12 years (Rule of 72).",
                "Post-Retirement Return Risk: Keep retirement returns conservative (7-8%) since high-risk equity draws during market downturns risk sequence-of-returns erosion.",
                "Safe Withdrawal Rate: Aim to withdraw no more than 3.5% - 4.0% of your initial retirement corpus in year one, indexing upward for inflation each subsequent year.",
                "Power of Working 3 Years Longer: Delaying retirement by just 3 years reduces required corpus while giving your investments 3 additional years of high-compound growth."
        );
    }
}
