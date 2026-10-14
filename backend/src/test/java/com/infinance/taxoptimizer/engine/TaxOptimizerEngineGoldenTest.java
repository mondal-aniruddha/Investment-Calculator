package com.infinance.taxoptimizer.engine;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Golden-Value Characterization Tests for TaxOptimizerEngine")
class TaxOptimizerEngineGoldenTest {

    @Test
    @DisplayName("Golden: Section 80C remaining cap calculation")
    void testSection80cRemainingCap() {
        BigDecimal cap = new BigDecimal("150000.00");

        // Partial usage
        BigDecimal remaining1 = TaxOptimizerEngine.remaining(new BigDecimal("50000.00"), cap);
        assertThat(remaining1).isEqualByComparingTo("100000.00");

        // Zero usage
        BigDecimal remaining2 = TaxOptimizerEngine.remaining(BigDecimal.ZERO, cap);
        assertThat(remaining2).isEqualByComparingTo("150000.00");

        // Full usage
        BigDecimal remaining3 = TaxOptimizerEngine.remaining(new BigDecimal("150000.00"), cap);
        assertThat(remaining3).isEqualByComparingTo("0.00");

        // Exceeded cap (floored at zero)
        BigDecimal remaining4 = TaxOptimizerEngine.remaining(new BigDecimal("200000.00"), cap);
        assertThat(remaining4).isEqualByComparingTo("0.00");

        // Null current usage (treated as zero)
        BigDecimal remaining5 = TaxOptimizerEngine.remaining(null, cap);
        assertThat(remaining5).isEqualByComparingTo("150000.00");
    }

    @Test
    @DisplayName("Golden: NPS 80CCD(1B) remaining cap calculation")
    void testNpsRemainingCap() {
        BigDecimal npsCap = new BigDecimal("50000.00");
        BigDecimal remaining = TaxOptimizerEngine.remaining(new BigDecimal("20000.00"), npsCap);
        assertThat(remaining).isEqualByComparingTo("30000.00");
    }
}
