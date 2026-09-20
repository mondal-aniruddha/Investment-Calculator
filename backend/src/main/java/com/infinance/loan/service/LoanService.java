package com.infinance.loan.service;

import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.config_engine.service.AssumptionService;
import com.infinance.loan.dto.*;
import com.infinance.loan.engine.LoanEngine;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class LoanService {
    private final AssumptionService assumptions;
    public LoanService(AssumptionService assumptions) { this.assumptions = assumptions; }

    public LoanCalculationResponse emi(LoanEmiRequest r) {
        return withAssumptions(LoanEngine.calculateEmi(r.principal(), r.tenureYears(), r.annualInterestRate()),
                Map.of("calculation", "EMI", "annualInterestRate", r.annualInterestRate()));
    }
    public LoanCalculationResponse prepayment(LoanPrepaymentRequest r) {
        return withAssumptions(LoanEngine.calculatePrepayment(r.principal(), r.tenureYears(), r.annualInterestRate(),
                r.prepaymentMonth(), r.partPayment()), Map.of("prepaymentMode", "REDUCE_TENURE_OR_EMI"));
    }
    public LoanCalculationResponse compare(SurplusComparisonRequest r) {
        LoanPrepaymentRequest l = r.loan();
        return withAssumptions(LoanEngine.compareSurplus(l.principal(), l.tenureYears(), l.annualInterestRate(),
                l.prepaymentMonth(), l.partPayment(), r.monthlySurplus(), r.sipAnnualReturn()),
                Map.of("comparison", "PART_PAYMENT_VS_SIP", "sipAnnualReturn", r.sipAnnualReturn()));
    }
    public LoanCalculationResponse transfer(BalanceTransferRequest r) {
        return withAssumptions(LoanEngine.balanceTransfer(r.outstandingPrincipal(), r.remainingTenureYears(),
                r.currentAnnualRate(), r.newAnnualRate(), r.processingFeePercent()),
                Map.of("comparison", "BALANCE_TRANSFER", "processingFeePercent", r.processingFeePercent()));
    }
    public LoanCalculationResponse floating(FloatingRateRequest r) {
        return withAssumptions(LoanEngine.floatingRate(r.principal(), r.tenureYears(),
                r.currentAnnualRate(), r.simulatedAnnualRate()),
                Map.of("comparison", "FLOATING_RATE_SIMULATION", "simulatedAnnualRate", r.simulatedAnnualRate()));
    }
    private LoanCalculationResponse withAssumptions(LoanCalculationResponse result, Map<String, Object> extras) {
        BaseAssumptionsDto dto = assumptions.buildBaseAssumptions(null, extras);
        return new LoanCalculationResponse(result.emi(), result.totalInterest(), result.totalPayment(),
                result.tenureMonths(), result.revisedEmi(), result.revisedTenureMonths(), result.interestSaved(),
                result.investmentCorpus(), result.netBenefit(), result.schedule(), dto);
    }
}
