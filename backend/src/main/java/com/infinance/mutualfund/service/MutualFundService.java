package com.infinance.mutualfund.service;

import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.common.engine.LumpsumCalculationEngine;
import com.infinance.common.engine.SipCalculationEngine;
import com.infinance.configengine.service.AssumptionService;
import com.infinance.mutualfund.dto.CagrRequest;
import com.infinance.mutualfund.dto.MutualFundResponse;
import com.infinance.mutualfund.dto.SwpRequest;
import com.infinance.mutualfund.dto.XirrRequest;
import com.infinance.mutualfund.engine.MutualFundEngine;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class MutualFundService {
    private final AssumptionService assumptions;

    public MutualFundService(AssumptionService assumptions) {
        this.assumptions = assumptions;
    }

    public MutualFundResponse sip(BigDecimal monthly, int years, BigDecimal rate, BigDecimal stepUp) {
        BigDecimal effectiveStepUp = (stepUp != null && stepUp.compareTo(BigDecimal.ZERO) > 0) ? stepUp : BigDecimal.ZERO;
        var corpusResult = SipCalculationEngine.calculateCorpus(monthly, years, rate, effectiveStepUp);
        var yearlyBreakdown = SipCalculationEngine.calculateYearlyProgression(monthly, years, rate, effectiveStepUp);
        List<MutualFundResponse.ProjectionPoint> projection = yearlyBreakdown.stream()
                .map(p -> new MutualFundResponse.ProjectionPoint(p.year(), p.corpusExpected(), p.investedCumulative()))
                .toList();
        return new MutualFundResponse(corpusResult.totalInvested(), corpusResult.maturityCorpus(),
                corpusResult.returnsEarned(), null, null, null, projection,
                assumptions.buildBaseAssumptions(null, Map.of("tool", "SIP", "annualReturn", rate, "stepUp", effectiveStepUp)));
    }

    public MutualFundResponse lumpsum(BigDecimal principal, int years, BigDecimal rate) {
        var corpusResult = LumpsumCalculationEngine.calculateCorpus(principal, years, rate);
        var yearlyBreakdown = LumpsumCalculationEngine.calculateYearlyProgression(principal, years, rate);
        List<MutualFundResponse.ProjectionPoint> projection = yearlyBreakdown.stream()
                .map(p -> new MutualFundResponse.ProjectionPoint(p.year(), p.corpusExpected(), p.investedCumulative()))
                .toList();
        return new MutualFundResponse(corpusResult.totalInvested(), corpusResult.maturityCorpus(),
                corpusResult.estimatedReturns(), null, null, null, projection,
                assumptions.buildBaseAssumptions(null, Map.of("tool", "LUMPSUM", "annualReturn", rate)));
    }

    public MutualFundResponse swp(SwpRequest r) {
        var result = MutualFundEngine.swp(r.initialCorpus(), r.annualReturn(), r.monthlyWithdrawal(),
                r.tenureYears(), r.annualWithdrawalIncrease() == null ? BigDecimal.ZERO : r.annualWithdrawalIncrease());
        return with(result, Map.of("tool", "SWP", "annualReturn", r.annualReturn()));
    }

    public BigDecimal cagr(CagrRequest r) {
        return MutualFundEngine.cagr(r.initialValue(), r.finalValue(), r.tenureYears());
    }

    public BigDecimal xirr(XirrRequest r) {
        return MutualFundEngine.xirr(r.cashFlows());
    }

    private MutualFundResponse with(MutualFundResponse result, Map<String, Object> extras) {
        BaseAssumptionsDto a = assumptions.buildBaseAssumptions(null, extras);
        return new MutualFundResponse(result.totalInvested(), result.maturityCorpus(), result.estimatedReturns(),
                result.withdrawalTotal(), result.remainingCorpus(), result.annualizedReturn(), result.projection(), a);
    }
}
