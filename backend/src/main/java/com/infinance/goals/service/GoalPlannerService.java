package com.infinance.goals.service;
import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.config_engine.service.AssumptionService;
import com.infinance.goals.dto.*;
import com.infinance.goals.engine.GoalPlannerEngine;
import org.springframework.stereotype.Service;
import java.util.Map;
@Service public class GoalPlannerService {
    private final AssumptionService assumptions;
    public GoalPlannerService(AssumptionService assumptions) { this.assumptions = assumptions; }
    public GoalPlanResponse calculate(GoalPlanRequest request) {
        var r = GoalPlannerEngine.calculate(request);
        BaseAssumptionsDto a = assumptions.buildBaseAssumptions(null, Map.of("tool", "MULTI_GOAL_PLANNER"));
        return new GoalPlanResponse(r.goals(), r.totalRequiredMonthlyInvestment(), r.availableMonthlySavings(),
                r.exceedsAvailableSavings(), r.suggestions(), a);
    }
}
