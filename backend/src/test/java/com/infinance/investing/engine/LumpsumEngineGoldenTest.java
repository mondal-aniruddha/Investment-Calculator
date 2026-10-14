package com.infinance.investing.engine;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Golden-Value Characterization Tests for LumpsumEngine")
class LumpsumEngineGoldenTest {

    @Test
    @DisplayName("Golden: ₹1,00,000 at 12% p.a. for 5 years")
    void testStandardFiveYearLumpsum() {
        BigDecimal principal = new BigDecimal("100000.00");
        int tenureYears = 5;
        BigDecimal annualReturn = new BigDecimal("12.00");

        LumpsumEngine.LumpsumResult result = LumpsumEngine.calculate(principal, tenureYears, annualReturn);

        assertThat(result.totalInvested()).isEqualByComparingTo("100000.00");
        assertThat(result.maturityCorpus()).isEqualByComparingTo("176234.17");
        assertThat(result.estimatedReturns()).isEqualByComparingTo("76234.17");
        assertThat(result.yearlyBreakdown()).hasSize(5);

        // Year 1
        assertThat(result.yearlyBreakdown().get(0).year()).isEqualTo(1);
        assertThat(result.yearlyBreakdown().get(0).corpusExpected()).isEqualByComparingTo("112000.00");
        assertThat(result.yearlyBreakdown().get(0).returnsEarnedCumulative()).isEqualByComparingTo("12000.00");

        // Year 5
        assertThat(result.yearlyBreakdown().get(4).year()).isEqualTo(5);
        assertThat(result.yearlyBreakdown().get(4).corpusExpected()).isEqualByComparingTo("176234.17");
        assertThat(result.yearlyBreakdown().get(4).returnsEarnedCumulative()).isEqualByComparingTo("76234.17");
    }

    @Test
    @DisplayName("Golden: ₹5,00,000 at 10% p.a. for 10 years")
    void testTenYearLumpsum() {
        BigDecimal principal = new BigDecimal("500000.00");
        int tenureYears = 10;
        BigDecimal annualReturn = new BigDecimal("10.00");

        LumpsumEngine.LumpsumResult result = LumpsumEngine.calculate(principal, tenureYears, annualReturn);

        assertThat(result.totalInvested()).isEqualByComparingTo("500000.00");
        assertThat(result.maturityCorpus()).isEqualByComparingTo("1296871.23");
        assertThat(result.estimatedReturns()).isEqualByComparingTo("796871.23");
        assertThat(result.yearlyBreakdown()).hasSize(10);
    }

    @Test
    @DisplayName("Golden: ₹2,00,000 at 0% return")
    void testZeroPercentLumpsum() {
        BigDecimal principal = new BigDecimal("200000.00");
        int tenureYears = 3;
        BigDecimal annualReturn = BigDecimal.ZERO;

        LumpsumEngine.LumpsumResult result = LumpsumEngine.calculate(principal, tenureYears, annualReturn);

        assertThat(result.totalInvested()).isEqualByComparingTo("200000.00");
        assertThat(result.maturityCorpus()).isEqualByComparingTo("200000.00");
        assertThat(result.estimatedReturns()).isEqualByComparingTo("0.00");
    }
}
