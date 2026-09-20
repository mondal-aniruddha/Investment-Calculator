package com.infinance.healthscore.engine;
import com.infinance.healthscore.dto.*;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;
class FinancialHealthEngineTest {
    @Test void perfectInputsProduceMaximumScore() {
        var r = new HealthScoreRequest(new BigDecimal("100"), new BigDecimal("6"), BigDecimal.ZERO, new BigDecimal("100"), BigDecimal.ZERO, new BigDecimal("100"));
        assertThat(FinancialHealthEngine.calculate(r).score()).isEqualTo(100);
    }
}
