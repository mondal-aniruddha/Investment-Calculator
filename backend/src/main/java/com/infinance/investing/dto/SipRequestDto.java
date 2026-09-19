package com.infinance.investing.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Schema(description = "Request payload for Systematic Investment Plan (SIP) calculation")
public class SipRequestDto {

    @NotNull(message = "Monthly investment amount is mandatory")
    @DecimalMin(value = "100.00", message = "Monthly investment must be at least ₹100")
    @DecimalMax(value = "10000000.00", message = "Monthly investment cannot exceed ₹1 Crore")
    @Schema(description = "Monthly SIP amount in INR", example = "5000.00")
    private BigDecimal monthlyInvestment;

    @NotNull(message = "Investment horizon is mandatory")
    @Min(value = 1, message = "Horizon must be at least 1 year")
    @Max(value = 50, message = "Horizon cannot exceed 50 years")
    @Schema(description = "Investment tenure in years", example = "10")
    private Integer investmentHorizonYears;

    @DecimalMin(value = "0.00", message = "Expected return cannot be negative")
    @DecimalMax(value = "30.00", message = "Expected return cannot exceed 30% p.a.")
    @Schema(description = "Expected annual rate of return in percentage", example = "12.0")
    private BigDecimal expectedAnnualReturn;

    @DecimalMin(value = "0.00", message = "Step-up percentage cannot be negative")
    @DecimalMax(value = "50.00", message = "Annual step-up cannot exceed 50%")
    @Schema(description = "Optional annual increase in monthly SIP amount in percentage", example = "10.0")
    private BigDecimal annualStepUpPercent;

    @Schema(description = "Investor risk tolerance: LOW, MODERATE, or AGGRESSIVE", example = "MODERATE")
    private String riskProfile = "MODERATE";

    public SipRequestDto() {
    }

    public SipRequestDto(BigDecimal monthlyInvestment, Integer investmentHorizonYears,
                         BigDecimal expectedAnnualReturn, BigDecimal annualStepUpPercent,
                         String riskProfile) {
        this.monthlyInvestment = monthlyInvestment;
        this.investmentHorizonYears = investmentHorizonYears;
        this.expectedAnnualReturn = expectedAnnualReturn;
        this.annualStepUpPercent = annualStepUpPercent;
        this.riskProfile = riskProfile != null ? riskProfile : "MODERATE";
    }

    public BigDecimal getMonthlyInvestment() { return monthlyInvestment; }
    public void setMonthlyInvestment(BigDecimal monthlyInvestment) { this.monthlyInvestment = monthlyInvestment; }

    public Integer getInvestmentHorizonYears() { return investmentHorizonYears; }
    public void setInvestmentHorizonYears(Integer investmentHorizonYears) { this.investmentHorizonYears = investmentHorizonYears; }

    public BigDecimal getExpectedAnnualReturn() { return expectedAnnualReturn; }
    public void setExpectedAnnualReturn(BigDecimal expectedAnnualReturn) { this.expectedAnnualReturn = expectedAnnualReturn; }

    public BigDecimal getAnnualStepUpPercent() { return annualStepUpPercent; }
    public void setAnnualStepUpPercent(BigDecimal annualStepUpPercent) { this.annualStepUpPercent = annualStepUpPercent; }

    public String getRiskProfile() { return riskProfile; }
    public void setRiskProfile(String riskProfile) { this.riskProfile = riskProfile; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private BigDecimal monthlyInvestment;
        private Integer investmentHorizonYears;
        private BigDecimal expectedAnnualReturn;
        private BigDecimal annualStepUpPercent;
        private String riskProfile = "MODERATE";

        public Builder monthlyInvestment(BigDecimal val) { this.monthlyInvestment = val; return this; }
        public Builder investmentHorizonYears(Integer val) { this.investmentHorizonYears = val; return this; }
        public Builder expectedAnnualReturn(BigDecimal val) { this.expectedAnnualReturn = val; return this; }
        public Builder annualStepUpPercent(BigDecimal val) { this.annualStepUpPercent = val; return this; }
        public Builder riskProfile(String val) { this.riskProfile = val; return this; }
        public SipRequestDto build() {
            return new SipRequestDto(monthlyInvestment, investmentHorizonYears, expectedAnnualReturn, annualStepUpPercent, riskProfile);
        }
    }
}
