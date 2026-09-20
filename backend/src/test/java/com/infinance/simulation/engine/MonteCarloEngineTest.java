package com.infinance.simulation.engine;
import com.infinance.simulation.dto.*;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;
class MonteCarloEngineTest {
    @Test void sameSeedProducesSamePercentiles() {
        var r = new MonteCarloRequest(BigDecimal.ZERO, new BigDecimal("1000"), 5, new BigDecimal("10"), new BigDecimal("5"), BigDecimal.ZERO, new BigDecimal("50000"), 1000, 7L);
        assertThat(MonteCarloEngine.calculate(r).percentile50()).isEqualByComparingTo(MonteCarloEngine.calculate(r).percentile50());
    }
}
