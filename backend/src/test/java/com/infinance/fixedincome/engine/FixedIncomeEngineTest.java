package com.infinance.fixedincome.engine;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;

class FixedIncomeEngineTest {
    @Test
    void zeroRateFixedIncomeReturnsPrincipal() {
        var result = FixedIncomeEngine.calculate("FD", new BigDecimal("100000"), 5,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, false);
        assertThat(result.maturityValue()).isEqualByComparingTo("100000.00");
    }
}
