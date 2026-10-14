package com.infinance.investing.dto;

import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.common.dto.MoneyAmount;

import java.math.BigDecimal;
import java.util.List;

public class LumpsumResponse {
    private BigDecimal totalInvested;
    private BigDecimal estimatedReturns;
    private BigDecimal maturityCorpus;
    private MoneyAmount totalInvestedFormatted;
    private MoneyAmount estimatedReturnsFormatted;
    private MoneyAmount maturityCorpusFormatted;
    private List<YearlyGrowthDto> yearlyBreakdown;
    private BaseAssumptionsDto assumptions;

    public LumpsumResponse() {}

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
        private final LumpsumResponse res = new LumpsumResponse();
        public Builder totalInvested(BigDecimal val) { res.setTotalInvested(val); return this; }
        public Builder estimatedReturns(BigDecimal val) { res.setEstimatedReturns(val); return this; }
        public Builder maturityCorpus(BigDecimal val) { res.setMaturityCorpus(val); return this; }
        public Builder totalInvestedFormatted(MoneyAmount val) { res.setTotalInvestedFormatted(val); return this; }
        public Builder estimatedReturnsFormatted(MoneyAmount val) { res.setEstimatedReturnsFormatted(val); return this; }
        public Builder maturityCorpusFormatted(MoneyAmount val) { res.setMaturityCorpusFormatted(val); return this; }
        public Builder yearlyBreakdown(List<YearlyGrowthDto> val) { res.setYearlyBreakdown(val); return this; }
        public Builder assumptions(BaseAssumptionsDto val) { res.setAssumptions(val); return this; }
        public LumpsumResponse build() { return res; }
    }
}
