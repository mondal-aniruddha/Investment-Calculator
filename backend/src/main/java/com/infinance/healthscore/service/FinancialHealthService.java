package com.infinance.healthscore.service;
import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.config_engine.service.AssumptionService;
import com.infinance.healthscore.dto.*;
import com.infinance.healthscore.engine.FinancialHealthEngine;
import org.springframework.stereotype.Service;
import java.util.Map;
@Service public class FinancialHealthService {
    private final AssumptionService assumptions;
    public FinancialHealthService(AssumptionService assumptions) { this.assumptions = assumptions; }
    public HealthScoreResponse calculate(HealthScoreRequest r) {
        var result = FinancialHealthEngine.calculate(r);
        BaseAssumptionsDto a = assumptions.buildBaseAssumptions(null, Map.of("tool", "FINANCIAL_HEALTH_SCORE", "weights", "20/20/15/15/10/20"));
        return new HealthScoreResponse(result.score(), result.band(), result.topImprovements(), a);
    }
}
