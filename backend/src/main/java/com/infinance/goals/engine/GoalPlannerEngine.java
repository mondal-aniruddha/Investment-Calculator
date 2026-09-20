package com.infinance.goals.engine;

import com.infinance.common.money.FinancialMath;
import com.infinance.goals.dto.GoalPlanRequest;
import com.infinance.goals.dto.GoalPlanResponse;
import java.math.*;
import java.util.*;

/** Pure goal planning engine. Required SIP = gap / [((1+i)^n - 1)/i * (1+i)]. */
public final class GoalPlannerEngine {
    private GoalPlannerEngine() {}
    public static GoalPlanResponse calculate(GoalPlanRequest request) {
        List<GoalPlanResponse.GoalResult> results = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (var goal : request.goals()) {
            BigDecimal saved = goal.currentSavings() == null ? BigDecimal.ZERO : goal.currentSavings();
            BigDecimal rate = goal.expectedAnnualReturn() == null ? BigDecimal.ZERO : goal.expectedAnnualReturn();
            BigDecimal monthly = FinancialMath.annualPercentToMonthlyRate(rate);
            BigDecimal gap = goal.targetAmount().subtract(saved).max(BigDecimal.ZERO);
            BigDecimal factor = monthly.compareTo(BigDecimal.ZERO) == 0
                    ? BigDecimal.valueOf(goal.monthsUntilGoal())
                    : BigDecimal.ONE.add(monthly).pow(goal.monthsUntilGoal(), FinancialMath.MC_CALC)
                    .subtract(BigDecimal.ONE).divide(monthly, FinancialMath.MC_CALC).multiply(BigDecimal.ONE.add(monthly));
            BigDecimal required = gap.divide(factor, FinancialMath.MC_CALC).setScale(2, RoundingMode.HALF_UP);
            total = total.add(required);
            results.add(new GoalPlanResponse.GoalResult(goal.name(), required, gap,
                    required.compareTo(BigDecimal.ZERO) == 0 ? "ON_TRACK" : "ACTION_NEEDED", goal.priority()));
        }
        boolean exceeds = total.compareTo(request.availableMonthlySavings()) > 0;
        List<String> suggestions = new ArrayList<>();
        if (exceeds) {
            suggestions.add("Prioritise lower-priority goals after funding the highest-priority goal.");
            suggestions.add("Increase the timeline or monthly savings for the largest shortfall.");
        } else suggestions.add("Your available monthly savings cover the requested goals under these assumptions.");
        return new GoalPlanResponse(results, total.setScale(2, RoundingMode.HALF_UP),
                request.availableMonthlySavings(), exceeds, suggestions, null);
    }
}
