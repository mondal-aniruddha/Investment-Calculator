package com.infinance.investing.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Schema(description = "Request payload for Lumpsum Investment calculation")
public class LumpsumRequest {
    @NotNull(message = "Investment amount is mandatory")
    @DecimalMin(value = "500.00", message = "Minimum lumpsum amount is ₹500")
    @DecimalMax(value = "1000000000.00", message = "Amount cannot exceed ₹100 Crore")
    private BigDecimal totalInvestment;

    @NotNull(message = "Investment horizon is mandatory")
    @Min(value = 1, message = "Horizon must be at least 1 year")
    @Max(value = 50, message = "Horizon cannot exceed 50 years")
    private Integer investmentHorizonYears;

    @DecimalMin(value = "0.00", message = "Expected return cannot be negative")
    @DecimalMax(value = "30.00", message = "Expected return cannot exceed 30% p.a.")
    private BigDecimal expectedAnnualReturn;

    public LumpsumRequest() {}

    public LumpsumRequest(BigDecimal totalInvestment, Integer investmentHorizonYears, BigDecimal expectedAnnualReturn) {
        this.totalInvestment = totalInvestment;
        this.investmentHorizonYears = investmentHorizonYears;
        this.expectedAnnualReturn = expectedAnnualReturn;
    }

    public BigDecimal getTotalInvestment() { return totalInvestment; }
    public void setTotalInvestment(BigDecimal totalInvestment) { this.totalInvestment = totalInvestment; }
    public Integer getInvestmentHorizonYears() { return investmentHorizonYears; }
    public void setInvestmentHorizonYears(Integer investmentHorizonYears) { this.investmentHorizonYears = investmentHorizonYears; }
    public BigDecimal getExpectedAnnualReturn() { return expectedAnnualReturn; }
    public void setExpectedAnnualReturn(BigDecimal expectedAnnualReturn) { this.expectedAnnualReturn = expectedAnnualReturn; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private BigDecimal totalInvestment;
        private Integer investmentHorizonYears;
        private BigDecimal expectedAnnualReturn;
        public Builder totalInvestment(BigDecimal val) { this.totalInvestment = val; return this; }
        public Builder investmentHorizonYears(Integer val) { this.investmentHorizonYears = val; return this; }
        public Builder expectedAnnualReturn(BigDecimal val) { this.expectedAnnualReturn = val; return this; }
        public LumpsumRequest build() { return new LumpsumRequest(totalInvestment, investmentHorizonYears, expectedAnnualReturn); }
    }
}
