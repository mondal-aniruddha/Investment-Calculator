package com.infinance.retirement.service;

import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.common.dto.MoneyAmount;
import com.infinance.config_engine.service.AssumptionService;
import com.infinance.retirement.dto.RetirementRequestDto;
import com.infinance.retirement.dto.RetirementResponseDto;
import com.infinance.retirement.engine.RetirementEngine;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class RetirementService {

    private final AssumptionService assumptionService;

    public RetirementService(AssumptionService assumptionService) {
        this.assumptionService = assumptionService;
    }

    public RetirementResponseDto calculateRetirementPlan(RetirementRequestDto request) {
        BigDecimal preReturn = request.getExpectedReturnPreRetirement() != null
                ? request.getExpectedReturnPreRetirement()
                : assumptionService.getProperties().getRates().getMarketBenchmarks().getEquityNiftyCagr();

        BigDecimal postReturn = request.getExpectedReturnPostRetirement() != null
                ? request.getExpectedReturnPostRetirement()
                : assumptionService.getProperties().getRates().getMarketBenchmarks().getDebtHybridCagr();

        BigDecimal inflation = request.getExpectedInflationRate() != null
                ? request.getExpectedInflationRate()
                : assumptionService.getProperties().getRates().getInflation().getCpiGeneralRate();

        BigDecimal existingCorpus = request.getExistingRetirementCorpus() != null
                ? request.getExistingRetirementCorpus()
                : BigDecimal.ZERO;

        BigDecimal monthlyContribution = request.getCurrentMonthlyContribution() != null
                ? request.getCurrentMonthlyContribution()
                : BigDecimal.ZERO;

        BigDecimal stepUp = request.getAnnualStepUpPercent() != null
                ? request.getAnnualStepUpPercent()
                : BigDecimal.ZERO;

        int lifeExpectancy = (request.getLifeExpectancy() != null && request.getLifeExpectancy() > request.getTargetRetirementAge())
                ? request.getLifeExpectancy()
                : 85;

        RetirementEngine.RetirementEngineResult result = RetirementEngine.calculate(
                request.getCurrentAge(),
                request.getTargetRetirementAge(),
                lifeExpectancy,
                request.getCurrentMonthlyExpenses(),
                existingCorpus,
                monthlyContribution,
                preReturn,
                postReturn,
                inflation,
                stepUp
        );

        Map<String, Object> moduleExtras = new HashMap<>();
        moduleExtras.put("expectedReturnPreRetirement", preReturn);
        moduleExtras.put("expectedReturnPostRetirement", postReturn);
        moduleExtras.put("expectedInflationRate", inflation);
        moduleExtras.put("annualStepUpPercent", stepUp);

        BaseAssumptionsDto assumptions = assumptionService.buildBaseAssumptions(null, moduleExtras);

        return RetirementResponseDto.builder()
                .yearsToRetirement(result.yearsToRetirement())
                .retirementDurationYears(result.retirementDurationYears())
                .monthlyExpenseAtRetirement(result.monthlyExpenseAtRetirement())
                .annualExpenseAtRetirement(result.annualExpenseAtRetirement())
                .requiredCorpusAtRetirement(result.requiredCorpusAtRetirement())
                .projectedCorpusFromExistingSavings(result.projectedCorpusFromExistingSavings())
                .shortfallOrSurplus(result.shortfallOrSurplus())
                .isGoalAchieved(result.isGoalAchieved())
                .additionalMonthlySipRequired(result.additionalMonthlySipRequired())
                .monthlyExpenseAtRetirementFormatted(MoneyAmount.of(result.monthlyExpenseAtRetirement()))
                .requiredCorpusFormatted(MoneyAmount.of(result.requiredCorpusAtRetirement()))
                .projectedCorpusFormatted(MoneyAmount.of(result.projectedCorpusFromExistingSavings()))
                .shortfallOrSurplusFormatted(MoneyAmount.of(result.shortfallOrSurplus().abs()))
                .additionalMonthlySipFormatted(MoneyAmount.of(result.additionalMonthlySipRequired()))
                .ageTrajectory(result.ageTrajectory())
                .whatIfScenarios(result.whatIfScenarios())
                .planningInsights(RetirementEngine.getRetirementInsights())
                .assumptions(assumptions)
                .build();
    }
}
