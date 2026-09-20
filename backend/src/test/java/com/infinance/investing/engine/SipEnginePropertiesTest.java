package com.infinance.investing.engine;

import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.Assume;
import net.jqwik.api.constraints.DoubleRange;
import net.jqwik.api.constraints.IntRange;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class SipEnginePropertiesTest {

    @Property(tries = 80)
    void investedAmountMatchesContributionSchedule(
            @ForAll @DoubleRange(min = 100, max = 100000) double monthlyInvestment,
            @ForAll @IntRange(min = 1, max = 40) int years,
            @ForAll @DoubleRange(min = 0, max = 30) double annualReturn) {
        BigDecimal monthly = BigDecimal.valueOf(monthlyInvestment).setScale(2);
        BigDecimal annual = BigDecimal.valueOf(annualReturn).setScale(2);

        SipEngine.EngineCorpusResult result = SipEngine.calculateSingleCorpus(
                monthly, years, annual, BigDecimal.ZERO);

        assertThat(result.totalInvested())
                .isEqualByComparingTo(monthly.multiply(BigDecimal.valueOf(years * 12L)));
        assertThat(result.maturityCorpus()).isGreaterThanOrEqualTo(result.totalInvested());
        assertThat(result.returnsEarned()).isGreaterThanOrEqualTo(BigDecimal.ZERO);
    }

    @Property(tries = 60)
    void scenariosRemainOrderedForNonNegativeInputs(
            @ForAll @DoubleRange(min = 100, max = 100000) double monthlyInvestment,
            @ForAll @IntRange(min = 1, max = 30) int years,
            @ForAll @DoubleRange(min = 0, max = 30) double annualReturn) {
        BigDecimal monthly = BigDecimal.valueOf(monthlyInvestment).setScale(2);
        BigDecimal annual = BigDecimal.valueOf(annualReturn).setScale(2);
        Assume.that(annual.compareTo(BigDecimal.valueOf(3)) >= 0);

        SipEngine.SipCalculationResult result = SipEngine.calculate(
                monthly, years, annual, BigDecimal.ZERO);

        assertThat(result.pessimisticScenario().maturityCorpus())
                .isLessThanOrEqualTo(result.expectedScenario().maturityCorpus());
        assertThat(result.expectedScenario().maturityCorpus())
                .isLessThanOrEqualTo(result.optimisticScenario().maturityCorpus());
    }
}
