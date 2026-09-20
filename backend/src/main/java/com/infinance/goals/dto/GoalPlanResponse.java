package com.infinance.goals.dto;

import com.infinance.common.dto.BaseAssumptionsDto;
import java.math.BigDecimal;
import java.util.List;

public record GoalPlanResponse(
        List<GoalResult> goals,
        BigDecimal totalRequiredMonthlyInvestment,
        BigDecimal availableMonthlySavings,
        boolean exceedsAvailableSavings,
        List<String> suggestions,
        BaseAssumptionsDto assumptions
) {
    public record GoalResult(String name, BigDecimal requiredMonthlyInvestment, BigDecimal shortfall,
                             String status, Integer priority) {}
}
