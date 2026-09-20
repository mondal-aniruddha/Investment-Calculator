package com.infinance.goals.engine;
import com.infinance.goals.dto.*;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
class GoalPlannerEngineTest {
    @Test void zeroReturnGoalUsesStraightLineContribution() {
        var goal = new GoalPlanRequest.Goal("Emergency", new BigDecimal("120000"), 12, 1, BigDecimal.ZERO, BigDecimal.ZERO);
        assertThat(GoalPlannerEngine.calculate(new GoalPlanRequest(List.of(goal), new BigDecimal("10000")))
                .totalRequiredMonthlyInvestment()).isEqualByComparingTo("10000.00");
    }
}
