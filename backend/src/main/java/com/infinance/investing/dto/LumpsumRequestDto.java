package com.infinance.investing.dto;

import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.common.dto.MoneyAmount;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class LumpsumRequestDto {

    @Schema(description = "Request payload for Lumpsum Investment calculation")
    public static class Request {
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

        public Request() {}
        public Request(BigDecimal totalInvestment, Integer investmentHorizonYears, BigDecimal expectedAnnualReturn) {
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
            public Request build() { return new Request(totalInvestment, investmentHorizonYears, expectedAnnualReturn); }
        }
    }

    public static class Response {
        private BigDecimal totalInvested;
        private BigDecimal estimatedReturns;
        private BigDecimal maturityCorpus;
        private MoneyAmount totalInvestedFormatted;
        private MoneyAmount estimatedReturnsFormatted;
        private MoneyAmount maturityCorpusFormatted;
        private List<YearlyGrowthDto> yearlyBreakdown;
        private BaseAssumptionsDto assumptions;

        public Response() {}

        public BigDecimal getTotalInvested() { return totalInvested; }
        public void setTotalInvested(BigDecimal totalInvested) { this.totalInvested = totalInvested; }
        public BigDecimal getEstimatedReturns() { return estimatedReturns; }
        public void setEstimatedReturns(BigDecimal estimatedReturns) { this.estimatedReturns = estimatedReturns; }
        public BigDecimal getMaturityCorpus() { return maturityCorpus; }
        public void setMaturityCorpus(BigDecimal maturityCorpus) { this.maturityCorpus = maturityCorpus; }
        public MoneyAmount getTotalInvestedFormatted() { return totalInvestedFormatted; }
        public void setTotalInvestedFormatted(MoneyAmount totalInvestedFormatted) { this.totalInvestedFormatted = totalInvestedFormatted; }
        public MoneyAmount getEstimatedReturnsFormatted() { return estimatedReturnsFormatted; }
        public void setEstimatedReturnsFormatted(MoneyAmount estimatedReturnsFormatted) { this.estimatedReturnsFormatted = estimatedReturnsFormatted; }
        public MoneyAmount getMaturityCorpusFormatted() { return maturityCorpusFormatted; }
        public void setMaturityCorpusFormatted(MoneyAmount maturityCorpusFormatted) { this.maturityCorpusFormatted = maturityCorpusFormatted; }
        public List<YearlyGrowthDto> getYearlyBreakdown() { return yearlyBreakdown; }
        public void setYearlyBreakdown(List<YearlyGrowthDto> yearlyBreakdown) { this.yearlyBreakdown = yearlyBreakdown; }
        public BaseAssumptionsDto getAssumptions() { return assumptions; }
        public void setAssumptions(BaseAssumptionsDto assumptions) { this.assumptions = assumptions; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final Response res = new Response();
            public Builder totalInvested(BigDecimal val) { res.setTotalInvested(val); return this; }
            public Builder estimatedReturns(BigDecimal val) { res.setEstimatedReturns(val); return this; }
            public Builder maturityCorpus(BigDecimal val) { res.setMaturityCorpus(val); return this; }
            public Builder totalInvestedFormatted(MoneyAmount val) { res.setTotalInvestedFormatted(val); return this; }
            public Builder estimatedReturnsFormatted(MoneyAmount val) { res.setEstimatedReturnsFormatted(val); return this; }
            public Builder maturityCorpusFormatted(MoneyAmount val) { res.setMaturityCorpusFormatted(val); return this; }
            public Builder yearlyBreakdown(List<YearlyGrowthDto> val) { res.setYearlyBreakdown(val); return this; }
            public Builder assumptions(BaseAssumptionsDto val) { res.setAssumptions(val); return this; }
            public Response build() { return res; }
        }
    }
}
