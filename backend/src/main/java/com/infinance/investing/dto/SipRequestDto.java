package com.infinance.investing.dto;

import java.math.BigDecimal;

/**
 * Backward-compatible alias for {@link SipRequest}.
 */
public class SipRequestDto extends SipRequest {
    public SipRequestDto() {
        super();
    }

    public SipRequestDto(BigDecimal monthlyInvestment, Integer investmentHorizonYears,
                         BigDecimal expectedAnnualReturn, BigDecimal annualStepUpPercent,
                         String riskProfile) {
        super(monthlyInvestment, investmentHorizonYears, expectedAnnualReturn, annualStepUpPercent, riskProfile);
    }
}
