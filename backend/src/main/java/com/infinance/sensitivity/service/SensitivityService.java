package com.infinance.sensitivity.service;
import com.infinance.config_engine.service.AssumptionService;
import com.infinance.sensitivity.dto.*;
import com.infinance.sensitivity.engine.SensitivityEngine;
import org.springframework.stereotype.Service;
import java.util.Map;
@Service public class SensitivityService {
    private final AssumptionService assumptions;
    public SensitivityService(AssumptionService assumptions) { this.assumptions = assumptions; }
    public SensitivityResponse calculate(SensitivityRequest r) {
        var x = SensitivityEngine.calculate(r);
        return new SensitivityResponse(x.baseCorpus(), x.scenarios(),
                assumptions.buildBaseAssumptions(null, Map.of("tool", "SENSITIVITY_ANALYSIS", "inflationRate", r.inflationRate())));
    }
}
