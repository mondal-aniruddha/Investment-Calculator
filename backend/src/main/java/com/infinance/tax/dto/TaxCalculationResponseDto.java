package com.infinance.tax.dto;

import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.common.dto.MoneyAmount;

import java.math.BigDecimal;
import java.util.List;

public class TaxCalculationResponseDto {

    private String financialYear;
    private String assessmentYear;

    private RegimeTaxSummaryDto newRegime;
    private RegimeTaxSummaryDto oldRegime;

    private String recommendedRegime; // "NEW" or "OLD" or "EITHER"
    private BigDecimal taxDifference;
    private MoneyAmount taxDifferenceFormatted;
    private String summaryMessage;

    private List<String> taxTipsAndExplainer;
    private BaseAssumptionsDto assumptions;

    public TaxCalculationResponseDto() {
    }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public String getAssessmentYear() { return assessmentYear; }
    public void setAssessmentYear(String assessmentYear) { this.assessmentYear = assessmentYear; }

    public RegimeTaxSummaryDto getNewRegime() { return newRegime; }
    public void setNewRegime(RegimeTaxSummaryDto newRegime) { this.newRegime = newRegime; }

    public RegimeTaxSummaryDto getOldRegime() { return oldRegime; }
    public void setOldRegime(RegimeTaxSummaryDto oldRegime) { this.oldRegime = oldRegime; }

    public String getRecommendedRegime() { return recommendedRegime; }
    public void setRecommendedRegime(String recommendedRegime) { this.recommendedRegime = recommendedRegime; }

    public BigDecimal getTaxDifference() { return taxDifference; }
    public void setTaxDifference(BigDecimal taxDifference) { this.taxDifference = taxDifference; }

    public MoneyAmount getTaxDifferenceFormatted() { return taxDifferenceFormatted; }
    public void setTaxDifferenceFormatted(MoneyAmount taxDifferenceFormatted) { this.taxDifferenceFormatted = taxDifferenceFormatted; }

    public String getSummaryMessage() { return summaryMessage; }
    public void setSummaryMessage(String summaryMessage) { this.summaryMessage = summaryMessage; }

    public List<String> getTaxTipsAndExplainer() { return taxTipsAndExplainer; }
    public void setTaxTipsAndExplainer(List<String> taxTipsAndExplainer) { this.taxTipsAndExplainer = taxTipsAndExplainer; }

    public BaseAssumptionsDto getAssumptions() { return assumptions; }
    public void setAssumptions(BaseAssumptionsDto assumptions) { this.assumptions = assumptions; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final TaxCalculationResponseDto dto = new TaxCalculationResponseDto();

        public Builder financialYear(String val) { dto.setFinancialYear(val); return this; }
        public Builder assessmentYear(String val) { dto.setAssessmentYear(val); return this; }
        public Builder newRegime(RegimeTaxSummaryDto val) { dto.setNewRegime(val); return this; }
        public Builder oldRegime(RegimeTaxSummaryDto val) { dto.setOldRegime(val); return this; }
        public Builder recommendedRegime(String val) { dto.setRecommendedRegime(val); return this; }
        public Builder taxDifference(BigDecimal val) { dto.setTaxDifference(val); return this; }
        public Builder taxDifferenceFormatted(MoneyAmount val) { dto.setTaxDifferenceFormatted(val); return this; }
        public Builder summaryMessage(String val) { dto.setSummaryMessage(val); return this; }
        public Builder taxTipsAndExplainer(List<String> val) { dto.setTaxTipsAndExplainer(val); return this; }
        public Builder assumptions(BaseAssumptionsDto val) { dto.setAssumptions(val); return this; }
        public TaxCalculationResponseDto build() { return dto; }
    }
}
