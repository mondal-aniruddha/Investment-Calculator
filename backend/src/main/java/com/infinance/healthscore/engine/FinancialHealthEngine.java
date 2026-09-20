package com.infinance.healthscore.engine;
import com.infinance.healthscore.dto.*;
import java.util.*;
/** Weighted 0-100 score; higher savings, coverage and readiness help, while DTI/utilisation reduce it. */
@SuppressWarnings("null")
public final class FinancialHealthEngine {
    private FinancialHealthEngine() {}
    public static HealthScoreResponse calculate(HealthScoreRequest r) {
        double score = r.savingsRatePercent().doubleValue() * .20
                + Math.min(100, r.emergencyFundMonths().doubleValue() / 6 * 100) * .20
                + (100 - Math.min(100, r.debtToIncomePercent().doubleValue())) * .15
                + r.insuranceCoveragePercent().doubleValue() * .15
                + (100 - r.creditUtilizationPercent().doubleValue()) * .10
                + r.retirementReadinessPercent().doubleValue() * .20;
        List<Map.Entry<String, Double>> gaps = new ArrayList<>(List.of(
                Map.entry("Build emergency-fund coverage to at least six months.", Math.max(0, 100 - Math.min(100, r.emergencyFundMonths().doubleValue() / 6 * 100))),
                Map.entry("Reduce debt-to-income and high-cost debt.", Math.min(100, r.debtToIncomePercent().doubleValue())),
                Map.entry("Increase retirement readiness.", 100 - r.retirementReadinessPercent().doubleValue()),
                Map.entry("Review insurance coverage.", 100 - r.insuranceCoveragePercent().doubleValue()),
                Map.entry("Reduce revolving credit utilisation.", r.creditUtilizationPercent().doubleValue())));
        gaps.sort(Map.Entry.<String, Double>comparingByValue().reversed());
        List<String> improvements = gaps.stream().limit(3).map(Map.Entry::getKey).toList();
        int rounded = (int) Math.round(Math.max(0, Math.min(100, score)));
        return new HealthScoreResponse(rounded, rounded >= 80 ? "STRONG" : rounded >= 60 ? "HEALTHY" : rounded >= 40 ? "BUILDING" : "AT RISK", improvements, null);
    }
}
