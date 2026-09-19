package com.infinance.retirement.dto;

import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.common.dto.MoneyAmount;

import java.math.BigDecimal;
import java.util.List;

public class RetirementResponseDto {

    private int yearsToRetirement;
    private int retirementDurationYears;

    private BigDecimal monthlyExpenseAtRetirement;
    private BigDecimal annualExpenseAtRetirement;
    private BigDecimal requiredCorpusAtRetirement;
    private BigDecimal projectedCorpusFromExistingSavings;
    private BigDecimal shortfallOrSurplus;
    private boolean isGoalAchieved;
    private BigDecimal additionalMonthlySipRequired;

    // Formatted monetary figures
    private MoneyAmount monthlyExpenseAtRetirementFormatted;
    private MoneyAmount requiredCorpusFormatted;
    private MoneyAmount projectedCorpusFormatted;
    private MoneyAmount shortfallOrSurplusFormatted;
    private MoneyAmount additionalMonthlySipFormatted;

    private List<AgeTrajectoryDto> ageTrajectory;
    private List<RetirementWhatIfDto> whatIfScenarios;
    private List<String> planningInsights;
    private BaseAssumptionsDto assumptions;

    public RetirementResponseDto() {
    }

    public int getYearsToRetirement() { return yearsToRetirement; }
    public void setYearsToRetirement(int yearsToRetirement) { this.yearsToRetirement = yearsToRetirement; }

    public int getRetirementDurationYears() { return retirementDurationYears; }
    public void setRetirementDurationYears(int retirementDurationYears) { this.retirementDurationYears = retirementDurationYears; }

    public BigDecimal getMonthlyExpenseAtRetirement() { return monthlyExpenseAtRetirement; }
    public void setMonthlyExpenseAtRetirement(BigDecimal monthlyExpenseAtRetirement) { this.monthlyExpenseAtRetirement = monthlyExpenseAtRetirement; }

    public BigDecimal getAnnualExpenseAtRetirement() { return annualExpenseAtRetirement; }
    public void setAnnualExpenseAtRetirement(BigDecimal annualExpenseAtRetirement) { this.annualExpenseAtRetirement = annualExpenseAtRetirement; }

    public BigDecimal getRequiredCorpusAtRetirement() { return requiredCorpusAtRetirement; }
    public void setRequiredCorpusAtRetirement(BigDecimal requiredCorpusAtRetirement) { this.requiredCorpusAtRetirement = requiredCorpusAtRetirement; }

    public BigDecimal getProjectedCorpusFromExistingSavings() { return projectedCorpusFromExistingSavings; }
    public void setProjectedCorpusFromExistingSavings(BigDecimal projectedCorpusFromExistingSavings) { this.projectedCorpusFromExistingSavings = projectedCorpusFromExistingSavings; }

    public BigDecimal getShortfallOrSurplus() { return shortfallOrSurplus; }
    public void setShortfallOrSurplus(BigDecimal shortfallOrSurplus) { this.shortfallOrSurplus = shortfallOrSurplus; }

    public boolean isGoalAchieved() { return isGoalAchieved; }
    public void setGoalAchieved(boolean goalAchieved) { isGoalAchieved = goalAchieved; }

    public BigDecimal getAdditionalMonthlySipRequired() { return additionalMonthlySipRequired; }
    public void setAdditionalMonthlySipRequired(BigDecimal additionalMonthlySipRequired) { this.additionalMonthlySipRequired = additionalMonthlySipRequired; }

    public MoneyAmount getMonthlyExpenseAtRetirementFormatted() { return monthlyExpenseAtRetirementFormatted; }
    public void setMonthlyExpenseAtRetirementFormatted(MoneyAmount monthlyExpenseAtRetirementFormatted) { this.monthlyExpenseAtRetirementFormatted = monthlyExpenseAtRetirementFormatted; }

    public MoneyAmount getRequiredCorpusFormatted() { return requiredCorpusFormatted; }
    public void setRequiredCorpusFormatted(MoneyAmount requiredCorpusFormatted) { this.requiredCorpusFormatted = requiredCorpusFormatted; }

    public MoneyAmount getProjectedCorpusFormatted() { return projectedCorpusFormatted; }
    public void setProjectedCorpusFormatted(MoneyAmount projectedCorpusFormatted) { this.projectedCorpusFormatted = projectedCorpusFormatted; }

    public MoneyAmount getShortfallOrSurplusFormatted() { return shortfallOrSurplusFormatted; }
    public void setShortfallOrSurplusFormatted(MoneyAmount shortfallOrSurplusFormatted) { this.shortfallOrSurplusFormatted = shortfallOrSurplusFormatted; }

    public MoneyAmount getAdditionalMonthlySipFormatted() { return additionalMonthlySipFormatted; }
    public void setAdditionalMonthlySipFormatted(MoneyAmount additionalMonthlySipFormatted) { this.additionalMonthlySipFormatted = additionalMonthlySipFormatted; }

    public List<AgeTrajectoryDto> getAgeTrajectory() { return ageTrajectory; }
    public void setAgeTrajectory(List<AgeTrajectoryDto> ageTrajectory) { this.ageTrajectory = ageTrajectory; }

    public List<RetirementWhatIfDto> getWhatIfScenarios() { return whatIfScenarios; }
    public void setWhatIfScenarios(List<RetirementWhatIfDto> whatIfScenarios) { this.whatIfScenarios = whatIfScenarios; }

    public List<String> getPlanningInsights() { return planningInsights; }
    public void setPlanningInsights(List<String> planningInsights) { this.planningInsights = planningInsights; }

    public BaseAssumptionsDto getAssumptions() { return assumptions; }
    public void setAssumptions(BaseAssumptionsDto assumptions) { this.assumptions = assumptions; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final RetirementResponseDto dto = new RetirementResponseDto();

        public Builder yearsToRetirement(int val) { dto.setYearsToRetirement(val); return this; }
        public Builder retirementDurationYears(int val) { dto.setRetirementDurationYears(val); return this; }
        public Builder monthlyExpenseAtRetirement(BigDecimal val) { dto.setMonthlyExpenseAtRetirement(val); return this; }
        public Builder annualExpenseAtRetirement(BigDecimal val) { dto.setAnnualExpenseAtRetirement(val); return this; }
        public Builder requiredCorpusAtRetirement(BigDecimal val) { dto.setRequiredCorpusAtRetirement(val); return this; }
        public Builder projectedCorpusFromExistingSavings(BigDecimal val) { dto.setProjectedCorpusFromExistingSavings(val); return this; }
        public Builder shortfallOrSurplus(BigDecimal val) { dto.setShortfallOrSurplus(val); return this; }
        public Builder isGoalAchieved(boolean val) { dto.setGoalAchieved(val); return this; }
        public Builder additionalMonthlySipRequired(BigDecimal val) { dto.setAdditionalMonthlySipRequired(val); return this; }
        public Builder monthlyExpenseAtRetirementFormatted(MoneyAmount val) { dto.setMonthlyExpenseAtRetirementFormatted(val); return this; }
        public Builder requiredCorpusFormatted(MoneyAmount val) { dto.setRequiredCorpusFormatted(val); return this; }
        public Builder projectedCorpusFormatted(MoneyAmount val) { dto.setProjectedCorpusFormatted(val); return this; }
        public Builder shortfallOrSurplusFormatted(MoneyAmount val) { dto.setShortfallOrSurplusFormatted(val); return this; }
        public Builder additionalMonthlySipFormatted(MoneyAmount val) { dto.setAdditionalMonthlySipFormatted(val); return this; }
        public Builder ageTrajectory(List<AgeTrajectoryDto> val) { dto.setAgeTrajectory(val); return this; }
        public Builder whatIfScenarios(List<RetirementWhatIfDto> val) { dto.setWhatIfScenarios(val); return this; }
        public Builder planningInsights(List<String> val) { dto.setPlanningInsights(val); return this; }
        public Builder assumptions(BaseAssumptionsDto val) { dto.setAssumptions(val); return this; }
        public RetirementResponseDto build() { return dto; }
    }
}
