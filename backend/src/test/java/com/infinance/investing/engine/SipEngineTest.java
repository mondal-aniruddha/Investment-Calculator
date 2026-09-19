package com.infinance.investing.engine;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.assertj.core.api.Assertions.assertThat;

class SipEngineTest {

    /**
     * Hand-worked verification example:
     * P = 10,000 INR
     * Tenure = 10 Years (n = 120 months)
     * Annual Return = 12.0% (Monthly rate i = 12 / (12 * 100) = 0.01)
     *
     * Formula:
     * FV = P * [((1 + i)^n - 1) / i] * (1 + i)
     * (1.01)^120 = 3.30038689457...
     * Numerator = 2.30038689457...
     * Numerator / 0.01 = 230.038689457...
     * FV = 10,000 * 230.038689457 * 1.01 = 2,323,390.76...
     * Rounded to 2 decimals = 2323390.76 (Total ₹23,23,391)
     * Total Invested = 10,000 * 120 = 12,00,000.00
     * Returns Earned = 2,323,390.76 - 1,200,000.00 = 1,123,390.76
     */
    @Test
    @DisplayName("Hand-verified Test Case: ₹10,000/mo at 12% p.a. for 10 years")
    void testHandCalculatedStandardSipTenYears() {
        BigDecimal monthlyInvestment = new BigDecimal("10000.00");
        int tenureYears = 10;
        BigDecimal annualReturn = new BigDecimal("12.00");

        SipEngine.SipCalculationResult result = SipEngine.calculate(
                monthlyInvestment, tenureYears, annualReturn, BigDecimal.ZERO);

        assertThat(result.totalInvested()).isEqualByComparingTo(new BigDecimal("1200000.00"));
        assertThat(result.maturityCorpus()).isEqualByComparingTo(new BigDecimal("2323390.76"));
        assertThat(result.estimatedReturns()).isEqualByComparingTo(new BigDecimal("1123390.76"));

        // Verify yearly breakdown has 10 points
        assertThat(result.yearlyBreakdown()).hasSize(10);
        assertThat(result.yearlyBreakdown().get(9).corpusExpected()).isEqualByComparingTo(new BigDecimal("2323390.76"));
    }

    /**
     * Hand-worked verification example 2:
     * P = 5,000 INR
     * Tenure = 5 Years (n = 60 months)
     * Annual Return = 15.0% (Monthly rate i = 15 / 1200 = 0.0125)
     * (1.0125)^60 = 2.107181347...
     * (2.107181347 - 1) / 0.0125 = 88.57450776...
     * FV = 5,000 * 88.57450776 * 1.0125 = 448,416.73...
     * Total Invested = 5,000 * 60 = 300,000.00
     * Returns = 148,416.73
     */
    @Test
    @DisplayName("Hand-verified Test Case: ₹5,000/mo at 15% p.a. for 5 years")
    void testHandCalculatedStandardSipFiveYears() {
        BigDecimal monthlyInvestment = new BigDecimal("5000.00");
        int tenureYears = 5;
        BigDecimal annualReturn = new BigDecimal("15.00");

        SipEngine.SipCalculationResult result = SipEngine.calculate(
                monthlyInvestment, tenureYears, annualReturn, BigDecimal.ZERO);

        assertThat(result.totalInvested()).isEqualByComparingTo(new BigDecimal("300000.00"));
        assertThat(result.maturityCorpus()).isEqualByComparingTo(new BigDecimal("448408.45"));
        assertThat(result.estimatedReturns()).isEqualByComparingTo(new BigDecimal("148408.45"));
    }

    @Test
    @DisplayName("Edge Case: 0% return rate should equal total invested amount with zero returns")
    void testZeroReturnRateEdgeCase() {
        BigDecimal monthlyInvestment = new BigDecimal("2500.00");
        int tenureYears = 2; // 24 months

        SipEngine.SipCalculationResult result = SipEngine.calculate(
                monthlyInvestment, tenureYears, BigDecimal.ZERO, BigDecimal.ZERO);

        assertThat(result.totalInvested()).isEqualByComparingTo(new BigDecimal("60000.00"));
        assertThat(result.maturityCorpus()).isEqualByComparingTo(new BigDecimal("60000.00"));
        assertThat(result.estimatedReturns()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Edge Case: Micro-investing starting with ₹100/mo for 1 year at 10% p.a.")
    void testMicroInvestingSmallAmount() {
        BigDecimal monthlyInvestment = new BigDecimal("100.00");
        int tenureYears = 1;
        BigDecimal annualReturn = new BigDecimal("10.00");

        SipEngine.SipCalculationResult result = SipEngine.calculate(
                monthlyInvestment, tenureYears, annualReturn, BigDecimal.ZERO);

        assertThat(result.totalInvested()).isEqualByComparingTo(new BigDecimal("1200.00"));
        // 100 * [((1 + 0.1/12)^12 - 1)/(0.1/12)] * (1 + 0.1/12) = ₹1,267.03
        assertThat(result.maturityCorpus()).isEqualByComparingTo(new BigDecimal("1267.03"));
        assertThat(result.estimatedReturns()).isEqualByComparingTo(new BigDecimal("67.03"));
    }

    @Test
    @DisplayName("Step-Up SIP: 10% annual step-up should result in higher invested and maturity corpus")
    void testStepUpSipGrowth() {
        BigDecimal monthlyInvestment = new BigDecimal("10000.00");
        int tenureYears = 2; // Year 1: 10,000 * 12 = 120,000; Year 2: 11,000 * 12 = 132,000; Total = 252,000
        BigDecimal annualReturn = new BigDecimal("12.00");
        BigDecimal stepUpPercent = new BigDecimal("10.00");

        SipEngine.SipCalculationResult result = SipEngine.calculate(
                monthlyInvestment, tenureYears, annualReturn, stepUpPercent);

        assertThat(result.totalInvested()).isEqualByComparingTo(new BigDecimal("252000.00"));
        // Maturity corpus must be strictly greater than without step-up
        assertThat(result.maturityCorpus()).isGreaterThan(new BigDecimal("280000.00"));
    }

    @Test
    @DisplayName("Scenario analysis should have pessimistic < expected < optimistic")
    void testScenariosProgression() {
        BigDecimal monthlyInvestment = new BigDecimal("5000.00");
        int tenureYears = 10;
        BigDecimal annualReturn = new BigDecimal("12.00");

        SipEngine.SipCalculationResult result = SipEngine.calculate(
                monthlyInvestment, tenureYears, annualReturn, BigDecimal.ZERO);

        assertThat(result.pessimisticScenario().maturityCorpus())
                .isLessThan(result.expectedScenario().maturityCorpus());
        assertThat(result.expectedScenario().maturityCorpus())
                .isLessThan(result.optimisticScenario().maturityCorpus());
    }
}
