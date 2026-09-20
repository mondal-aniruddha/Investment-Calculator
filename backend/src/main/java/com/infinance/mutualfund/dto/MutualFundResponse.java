package com.infinance.mutualfund.dto;

import com.infinance.common.dto.BaseAssumptionsDto;
import java.math.BigDecimal;
import java.util.List;

public record MutualFundResponse(
        BigDecimal totalInvested,
        BigDecimal maturityCorpus,
        BigDecimal estimatedReturns,
        BigDecimal withdrawalTotal,
        BigDecimal remainingCorpus,
        BigDecimal annualizedReturn,
        List<ProjectionPoint> projection,
        BaseAssumptionsDto assumptions
) {
    public record ProjectionPoint(int year, BigDecimal value, BigDecimal contributionOrWithdrawal) {}
}
