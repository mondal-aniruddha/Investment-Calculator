package com.infinance.fixedincome.service;

import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.config_engine.service.AssumptionService;
import com.infinance.fixedincome.dto.*;
import com.infinance.fixedincome.engine.FixedIncomeEngine;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class FixedIncomeService {
    private final AssumptionService assumptions;
    public FixedIncomeService(AssumptionService assumptions) { this.assumptions = assumptions; }
    public FixedIncomeResponse calculate(FixedIncomeRequest r) {
        var p = assumptions.getProperties();
        var schemes = p.getRates().getGovernmentSchemes();
        String scheme = r.scheme().toUpperCase();
        BigDecimal rate = r.annualRate() != null ? r.annualRate() : switch (scheme) {
            case "PPF" -> schemes.getPpfRate();
            case "EPF" -> schemes.getEpfRate();
            case "NPS" -> schemes.getNpsExpectedCagr();
            case "SSY", "SUKANYA_SAMRIDDHI" -> schemes.getSsyRate();
            case "POST_OFFICE" -> schemes.getPostOfficeTimeDepositRate();
            case "RD" -> schemes.getRdRate();
            default -> schemes.getFdRate();
        };
        boolean recurring = scheme.equals("RD");
        BigDecimal taxRate = r.taxRate() != null ? r.taxRate() : BigDecimal.ZERO;
        BigDecimal inflation = r.inflationRate() != null ? r.inflationRate() : p.getRates().getInflation().getCpiGeneralRate();
        FixedIncomeResponse result = FixedIncomeEngine.calculate(scheme, r.contribution(), r.tenureYears(), rate,
                taxRate, inflation, recurring);
        BaseAssumptionsDto a = assumptions.buildBaseAssumptions(null,
                Map.of("scheme", scheme, "effectiveAnnualRate", rate, "taxRate", taxRate, "inflationRate", inflation));
        return new FixedIncomeResponse(result.scheme(), result.totalContribution(), result.maturityValue(),
                result.interestEarned(), result.postTaxValue(), result.inflationAdjustedValue(),
                result.effectiveRealReturn(), a);
    }
}
