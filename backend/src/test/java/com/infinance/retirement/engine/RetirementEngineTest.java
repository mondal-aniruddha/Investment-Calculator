package com.infinance.retirement.engine;

import com.infinance.common.exception.InvalidFinancialInputException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RetirementEngineTest {

    /**
     * Hand-worked verification example:
     * Current Age = 30, Target Retirement Age = 60, Life Expectancy = 85
     * Years to Retirement = 30
     * Retirement Duration = 25
     * Current Monthly Expenses = ₹50,000
     * Expected Inflation = 6.0% (rInf = 0.06)
     * Expected Pre-Retirement Return = 12.0%
     * Expected Post-Retirement Return = 7.0% (rPost = 0.07)
     * Existing Corpus = ₹10,00,000
     * Current Monthly Contribution = ₹15,000
     *
     * 1. Inflated monthly expenses at retirement:
     * 50,000 * (1.06)^30 = 50,000 * 5.74349117 = 287,174.56
     * Annual Expense = 287,174.56 * 12 = 3,446,094.72
     *
     * 2. Required Corpus:
     * v = 1.06 / 1.07 = 0.990654205607...
     * v^25 = 0.79051052...
     * (1 - v^25) / (1 - v) = 0.20948948 / 0.009345794 = 22.415386...
     * Required Corpus = 3,446,094.72 * 22.415386 = ~7,72,35,540
     */
    @Test
    @DisplayName("Hand-verified: 30-year accumulation and 25-year retirement with 6% inflation")
    void testHandCalculatedRetirementScenario() {
        RetirementEngine.RetirementEngineResult result = RetirementEngine.calculate(
                30,
                60,
                85,
                new BigDecimal("50000.00"),
                new BigDecimal("1000000.00"),
                new BigDecimal("150000.00"), // 1.5L / mo investment
                new BigDecimal("12.00"),
                new BigDecimal("7.00"),
                new BigDecimal("6.00"),
                BigDecimal.ZERO
        );

        assertThat(result.yearsToRetirement()).isEqualTo(30);
        assertThat(result.retirementDurationYears()).isEqualTo(25);

        // Verify monthly expense at age 60 is inflated by (1.06)^30
        assertThat(result.monthlyExpenseAtRetirement()).isEqualByComparingTo(new BigDecimal("287174.56"));
        assertThat(result.annualExpenseAtRetirement()).isEqualByComparingTo(new BigDecimal("3446094.72"));

        // Required corpus should be ~ ₹7.72 Crores
        assertThat(result.requiredCorpusAtRetirement()).isGreaterThan(new BigDecimal("77000000.00"));
        assertThat(result.requiredCorpusAtRetirement()).isLessThan(new BigDecimal("78000000.00"));

        // Age trajectory should cover ages 30 to 85 (56 entries)
        assertThat(result.ageTrajectory()).hasSize(56);
        assertThat(result.ageTrajectory().get(0).age()).isEqualTo(30);
        assertThat(result.ageTrajectory().get(0).phase()).isEqualTo("ACCUMULATION");
        assertThat(result.ageTrajectory().get(30).age()).isEqualTo(60);
        assertThat(result.ageTrajectory().get(30).phase()).isEqualTo("RETIREMENT");

        // What-if scenarios must include working longer / retiring earlier
        assertThat(result.whatIfScenarios()).isNotEmpty();
    }

    @Test
    @DisplayName("Should detect achieved goal when savings comfortably exceed requirement")
    void testGoalAchievedSurplus() {
        RetirementEngine.RetirementEngineResult result = RetirementEngine.calculate(
                45,
                55,
                80,
                new BigDecimal("40000.00"),
                new BigDecimal("50000000.00"), // ₹5 Crores existing
                new BigDecimal("200000.00"),
                new BigDecimal("12.00"),
                new BigDecimal("7.00"),
                new BigDecimal("6.00"),
                BigDecimal.ZERO
        );

        assertThat(result.isGoalAchieved()).isTrue();
        assertThat(result.additionalMonthlySipRequired()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.shortfallOrSurplus()).isLessThan(BigDecimal.ZERO); // Negative denotes surplus
    }

    @Test
    @DisplayName("Should throw validation exception when retirement age is less than or equal to current age")
    void testInvalidRetirementAgeThrowsException() {
        assertThatThrownBy(() -> RetirementEngine.calculate(
                40,
                38, // invalid
                85,
                new BigDecimal("50000.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                new BigDecimal("12.00"),
                new BigDecimal("7.00"),
                new BigDecimal("6.00"),
                BigDecimal.ZERO
        )).isInstanceOf(InvalidFinancialInputException.class)
                .hasMessageContaining("must be greater than current age");
    }

    @Test
    @DisplayName("Should throw validation exception when life expectancy is less than retirement age")
    void testInvalidLifeExpectancyThrowsException() {
        assertThatThrownBy(() -> RetirementEngine.calculate(
                30,
                60,
                55, // invalid
                new BigDecimal("50000.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                new BigDecimal("12.00"),
                new BigDecimal("7.00"),
                new BigDecimal("6.00"),
                BigDecimal.ZERO
        )).isInstanceOf(InvalidFinancialInputException.class)
                .hasMessageContaining("must be greater than target retirement age");
    }
}
