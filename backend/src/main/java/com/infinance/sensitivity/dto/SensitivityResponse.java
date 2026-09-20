package com.infinance.sensitivity.dto;
import com.infinance.common.dto.BaseAssumptionsDto;
import java.math.BigDecimal;
import java.util.List;
public record SensitivityResponse(BigDecimal baseCorpus, List<Scenario> scenarios, BaseAssumptionsDto assumptions) {
    public record Scenario(String variable, String direction, BigDecimal corpus, BigDecimal impact) {}
}
