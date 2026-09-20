package com.infinance.simulation.service;
import com.infinance.config_engine.service.AssumptionService;
import com.infinance.simulation.dto.*;
import com.infinance.simulation.engine.MonteCarloEngine;
import org.springframework.stereotype.Service;
import java.util.Map;
@Service public class MonteCarloService {
    private final AssumptionService assumptions;
    public MonteCarloService(AssumptionService assumptions) { this.assumptions = assumptions; }
    public MonteCarloResponse calculate(MonteCarloRequest r) {
        var x = MonteCarloEngine.calculate(r);
        return new MonteCarloResponse(x.runs(), x.successProbabilityPercent(), x.percentile10(), x.percentile50(), x.percentile90(),
                x.percentileBands(), assumptions.buildBaseAssumptions(null, Map.of("tool", "MONTE_CARLO", "seed", r.seed() == null ? 42L : r.seed())));
    }
}
