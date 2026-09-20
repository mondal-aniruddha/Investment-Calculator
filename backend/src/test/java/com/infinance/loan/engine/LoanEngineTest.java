package com.infinance.loan.engine;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;

class LoanEngineTest {
    @Test
    void handVerifiedOneYearZeroInterestLoan() {
        var result = LoanEngine.calculateEmi(new BigDecimal("120000"), 1, BigDecimal.ZERO);
        assertThat(result.emi()).isEqualByComparingTo("10000.00");
        assertThat(result.totalInterest()).isEqualByComparingTo("0.00");
    }
    @Test
    void standardFiveYearEmiIsStable() {
        assertThat(LoanEngine.emi(new BigDecimal("1000000"), 60, new BigDecimal("12")))
                .isEqualByComparingTo("22244.45");
    }
}
