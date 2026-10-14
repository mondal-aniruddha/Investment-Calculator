package com.infinance.investing.dto;

import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.common.dto.MoneyAmount;

import java.math.BigDecimal;
import java.util.List;

public class SipResponse {

    private BigDecimal totalInvested;
    private BigDecimal estimatedReturns;
    private BigDecimal maturityCorpus;
    private MoneyAmount totalInvestedFormatted;
    private MoneyAmount estimatedReturnsFormatted;
    private MoneyAmount maturityCorpusFormatted;

    private boolean isStepUp;
    private BigDecimal stepUpPercent;

    private ScenarioCorpusDto expectedScenario;
    private ScenarioCorpusDto pessimisticScenario;
    private ScenarioCorpusDto optimisticScenario;

    private List<YearlyGrowthDto> yearlyBreakdown;
    private List<AssetBucketDto> assetAllocation;
    private List<String> beginnerGuidance;
    private BaseAssumptionsDto assumptions;

    public SipResponse() {}

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

    public boolean isStepUp() { return isStepUp; }
    public void setStepUp(boolean stepUp) { isStepUp = stepUp; }

    public BigDecimal getStepUpPercent() { return stepUpPercent; }
    public void setStepUpPercent(BigDecimal stepUpPercent) { this.stepUpPercent = stepUpPercent; }

    public ScenarioCorpusDto getExpectedScenario() { return expectedScenario; }
    public void setExpectedScenario(ScenarioCorpusDto expectedScenario) { this.expectedScenario = expectedScenario; }

    public ScenarioCorpusDto getPessimisticScenario() { return pessimisticScenario; }
    public void setPessimisticScenario(ScenarioCorpusDto pessimisticScenario) { this.pessimisticScenario = pessimisticScenario; }

    public ScenarioCorpusDto getOptimisticScenario() { return optimisticScenario; }
    public void setOptimisticScenario(ScenarioCorpusDto optimisticScenario) { this.optimisticScenario = optimisticScenario; }

    public List<YearlyGrowthDto> getYearlyBreakdown() { return yearlyBreakdown; }
    public void setYearlyBreakdown(List<YearlyGrowthDto> yearlyBreakdown) { this.yearlyBreakdown = yearlyBreakdown; }

    public List<AssetBucketDto> getAssetAllocation() { return assetAllocation; }
    public void setAssetAllocation(List<AssetBucketDto> assetAllocation) { this.assetAllocation = assetAllocation; }

    public List<String> getBeginnerGuidance() { return beginnerGuidance; }
    public void setBeginnerGuidance(List<String> beginnerGuidance) { this.beginnerGuidance = beginnerGuidance; }

    public BaseAssumptionsDto getAssumptions() { return assumptions; }
    public void setAssumptions(BaseAssumptionsDto assumptions) { this.assumptions = assumptions; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final SipResponse res = new SipResponse();
        public Builder totalInvested(BigDecimal val) { res.setTotalInvested(val); return this; }
        public Builder estimatedReturns(BigDecimal val) { res.setEstimatedReturns(val); return this; }
        public Builder maturityCorpus(BigDecimal val) { res.setMaturityCorpus(val); return this; }
        public Builder totalInvestedFormatted(MoneyAmount val) { res.setTotalInvestedFormatted(val); return this; }
        public Builder estimatedReturnsFormatted(MoneyAmount val) { res.setEstimatedReturnsFormatted(val); return this; }
        public Builder maturityCorpusFormatted(MoneyAmount val) { res.setMaturityCorpusFormatted(val); return this; }
        public Builder isStepUp(boolean val) { res.setStepUp(val); return this; }
        public Builder stepUpPercent(BigDecimal val) { res.setStepUpPercent(val); return this; }
        public Builder expectedScenario(ScenarioCorpusDto val) { res.setExpectedScenario(val); return this; }
        public Builder pessimisticScenario(ScenarioCorpusDto val) { res.setPessimisticScenario(val); return this; }
        public Builder optimisticScenario(ScenarioCorpusDto val) { res.setOptimisticScenario(val); return this; }
        public Builder yearlyBreakdown(List<YearlyGrowthDto> val) { res.setYearlyBreakdown(val); return this; }
        public Builder assetAllocation(List<AssetBucketDto> val) { res.setAssetAllocation(val); return this; }
        public Builder beginnerGuidance(List<String> val) { res.setBeginnerGuidance(val); return this; }
        public Builder assumptions(BaseAssumptionsDto val) { res.setAssumptions(val); return this; }
        public SipResponse build() { return res; }
    }
}
