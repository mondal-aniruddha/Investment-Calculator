package com.infinance.mutualfund.service;

import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.config_engine.service.AssumptionService;
import com.infinance.investing.engine.LumpsumEngine;
import com.infinance.investing.engine.SipEngine;
import com.infinance.mutualfund.dto.*;
import com.infinance.mutualfund.engine.MutualFundEngine;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class MutualFundService {
    private final AssumptionService assumptions;
    public MutualFundService(AssumptionService assumptions) { this.assumptions = assumptions; }
    public MutualFundResponse sip(BigDecimal monthly, int years, BigDecimal rate, BigDecimal stepUp) {
        var result = SipEngine.calculate(monthly, years, rate, stepUp);
        return response(result.totalInvested(), result.maturityCorpus(), result.estimatedReturns(), null, null,
                result.yearlyBreakdown(), Map.of("tool", "SIP", "annualReturn", rate, "stepUp", stepUp));
    }
    public MutualFundResponse lumpsum(BigDecimal principal, int years, BigDecimal rate) {
        var result = LumpsumEngine.calculate(principal, years, rate);
        return response(result.totalInvested(), result.maturityCorpus(), result.estimatedReturns(), null, null,
                result.yearlyBreakdown(), Map.of("tool", "LUMPSUM", "annualReturn", rate));
    }
    public MutualFundResponse swp(SwpRequest r) {
        var result = MutualFundEngine.swp(r.initialCorpus(), r.annualReturn(), r.monthlyWithdrawal(),
                r.tenureYears(), r.annualWithdrawalIncrease() == null ? BigDecimal.ZERO : r.annualWithdrawalIncrease());
        return with(result, Map.of("tool", "SWP", "annualReturn", r.annualReturn()));
    }
    public BigDecimal cagr(CagrRequest r) { return MutualFundEngine.cagr(r.initialValue(), r.finalValue(), r.tenureYears()); }
    public BigDecimal xirr(XirrRequest r) { return MutualFundEngine.xirr(r.cashFlows()); }
    private MutualFundResponse response(BigDecimal invested, BigDecimal corpus, BigDecimal returns,
            BigDecimal withdrawals, BigDecimal remaining, java.util.List<?> points, Map<String,Object> extras) {
        List<MutualFundResponse.ProjectionPoint> projection = points.stream()
                .map(point -> {
                    var growth = (com.infinance.investing.dto.YearlyGrowthDto) point;
                    return new MutualFundResponse.ProjectionPoint(growth.year(), growth.corpusExpected(), growth.investedCumulative());
                }).toList();
        return new MutualFundResponse(invested, corpus, returns, withdrawals, remaining, null, projection,
                assumptions.buildBaseAssumptions(null, extras));
    }
    private MutualFundResponse with(MutualFundResponse result, Map<String,Object> extras) {
        BaseAssumptionsDto a = assumptions.buildBaseAssumptions(null, extras);
        return new MutualFundResponse(result.totalInvested(), result.maturityCorpus(), result.estimatedReturns(),
                result.withdrawalTotal(), result.remainingCorpus(), result.annualizedReturn(), result.projection(), a);
    }
}
