package com.infinance.loan.dto;

import com.infinance.common.dto.BaseAssumptionsDto;

import java.math.BigDecimal;
import java.util.List;

public record LoanCalculationResponse(
        BigDecimal emi,
        BigDecimal totalInterest,
        BigDecimal totalPayment,
        Integer tenureMonths,
        BigDecimal revisedEmi,
        Integer revisedTenureMonths,
        BigDecimal interestSaved,
        BigDecimal investmentCorpus,
        BigDecimal netBenefit,
        List<LoanSchedulePoint> schedule,
        BaseAssumptionsDto assumptions
) {
    public record LoanSchedulePoint(int month, BigDecimal principalBalance, BigDecimal interestPaid) {}
}
