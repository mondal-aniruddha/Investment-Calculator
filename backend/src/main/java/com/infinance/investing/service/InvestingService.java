package com.infinance.investing.service;

import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.common.dto.MoneyAmount;
import com.infinance.config_engine.service.AssumptionService;
import com.infinance.investing.dto.AssetBucketDto;
import com.infinance.investing.dto.LumpsumRequestDto;
import com.infinance.investing.dto.SipRequestDto;
import com.infinance.investing.dto.SipResponseDto;
import com.infinance.investing.engine.LumpsumEngine;
import com.infinance.investing.engine.SipEngine;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InvestingService {

    private final AssumptionService assumptionService;

    public InvestingService(AssumptionService assumptionService) {
        this.assumptionService = assumptionService;
    }

    public SipResponseDto calculateSip(SipRequestDto request) {
        BigDecimal annualReturn = request.getExpectedAnnualReturn();
        if (annualReturn == null) {
            String profile = request.getRiskProfile() != null ? request.getRiskProfile().toUpperCase() : "MODERATE";
            annualReturn = switch (profile) {
                case "LOW" -> assumptionService.getProperties().getRates().getMarketBenchmarks().getDebtHybridCagr();
                case "AGGRESSIVE" -> assumptionService.getProperties().getRates().getMarketBenchmarks().getEquityAggressiveCagr();
                default -> assumptionService.getProperties().getRates().getMarketBenchmarks().getEquityNiftyCagr();
            };
        }

        SipEngine.SipCalculationResult result = SipEngine.calculate(
                request.getMonthlyInvestment(),
                request.getInvestmentHorizonYears(),
                annualReturn,
                request.getAnnualStepUpPercent()
        );

        List<AssetBucketDto> assetAllocation = SipEngine.getAssetAllocation(request.getRiskProfile());
        List<String> guidance = SipEngine.getBeginnerGuidance();

        Map<String, Object> moduleExtras = new HashMap<>();
        moduleExtras.put("riskProfile", request.getRiskProfile());
        moduleExtras.put("effectiveAnnualReturn", annualReturn);
        moduleExtras.put("stepUpApplied", request.getAnnualStepUpPercent());

        BaseAssumptionsDto assumptions = assumptionService.buildBaseAssumptions(null, moduleExtras);

        return SipResponseDto.builder()
                .totalInvested(result.totalInvested())
                .estimatedReturns(result.estimatedReturns())
                .maturityCorpus(result.maturityCorpus())
                .totalInvestedFormatted(MoneyAmount.of(result.totalInvested()))
                .estimatedReturnsFormatted(MoneyAmount.of(result.estimatedReturns()))
                .maturityCorpusFormatted(MoneyAmount.of(result.maturityCorpus()))
                .isStepUp(request.getAnnualStepUpPercent() != null && request.getAnnualStepUpPercent().compareTo(BigDecimal.ZERO) > 0)
                .stepUpPercent(request.getAnnualStepUpPercent() != null ? request.getAnnualStepUpPercent() : BigDecimal.ZERO)
                .expectedScenario(result.expectedScenario())
                .pessimisticScenario(result.pessimisticScenario())
                .optimisticScenario(result.optimisticScenario())
                .yearlyBreakdown(result.yearlyBreakdown())
                .assetAllocation(assetAllocation)
                .beginnerGuidance(guidance)
                .assumptions(assumptions)
                .build();
    }

    public LumpsumRequestDto.Response calculateLumpsum(LumpsumRequestDto.Request request) {
        BigDecimal annualReturn = request.getExpectedAnnualReturn();
        if (annualReturn == null) {
            annualReturn = assumptionService.getProperties().getRates().getMarketBenchmarks().getEquityNiftyCagr();
        }

        LumpsumEngine.LumpsumResult result = LumpsumEngine.calculate(
                request.getTotalInvestment(),
                request.getInvestmentHorizonYears(),
                annualReturn
        );

        Map<String, Object> moduleExtras = Map.of(
                "effectiveAnnualReturn", annualReturn,
                "compoundingFrequency", "ANNUAL"
        );

        BaseAssumptionsDto assumptions = assumptionService.buildBaseAssumptions(null, moduleExtras);

        return LumpsumRequestDto.Response.builder()
                .totalInvested(result.totalInvested())
                .estimatedReturns(result.estimatedReturns())
                .maturityCorpus(result.maturityCorpus())
                .totalInvestedFormatted(MoneyAmount.of(result.totalInvested()))
                .estimatedReturnsFormatted(MoneyAmount.of(result.estimatedReturns()))
                .maturityCorpusFormatted(MoneyAmount.of(result.maturityCorpus()))
                .yearlyBreakdown(result.yearlyBreakdown())
                .assumptions(assumptions)
                .build();
    }
}
