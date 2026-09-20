package com.infinance.mutualfund.engine;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;

class MutualFundEngineTest {
    @Test
    void cagrForDoublingInTenYearsIsAboutSevenPercent() {
        assertThat(MutualFundEngine.cagr(new BigDecimal("100"), new BigDecimal("200"), new BigDecimal("10")))
                .isEqualByComparingTo("7.18");
    }
}
