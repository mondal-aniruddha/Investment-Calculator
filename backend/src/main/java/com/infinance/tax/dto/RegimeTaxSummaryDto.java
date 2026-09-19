package com.infinance.tax.dto;

import com.infinance.common.dto.MoneyAmount;

import java.math.BigDecimal;
import java.util.List;

public class RegimeTaxSummaryDto {

    private String regimeName; // "NEW" or "OLD"
    private BigDecimal grossTotalIncome;
    private BigDecimal standardDeduction;
    private BigDecimal totalDeductions;
    private BigDecimal netTaxableIncome;

    private List<SlabBreakdownItemDto> slabBreakdown;

    private BigDecimal taxBeforeRebate;
    private BigDecimal rebate87A;
    private BigDecimal taxAfterRebate;
    private BigDecimal surcharge;
    private BigDecimal cess;
    private BigDecimal totalTaxPayable;
    private BigDecimal effectiveTaxRatePercent;

    // Formatted monetary helpers
    private MoneyAmount grossIncomeFormatted;
    private MoneyAmount standardDeductionFormatted;
    private MoneyAmount totalDeductionsFormatted;
    private MoneyAmount netTaxableIncomeFormatted;
    private MoneyAmount taxBeforeRebateFormatted;
    private MoneyAmount rebate87AFormatted;
    private MoneyAmount cessFormatted;
    private MoneyAmount totalTaxPayableFormatted;

    public RegimeTaxSummaryDto() {
    }

    public String getRegimeName() { return regimeName; }
    public void setRegimeName(String regimeName) { this.regimeName = regimeName; }

    public BigDecimal getGrossTotalIncome() { return grossTotalIncome; }
    public void setGrossTotalIncome(BigDecimal grossTotalIncome) { this.grossTotalIncome = grossTotalIncome; }

    public BigDecimal getStandardDeduction() { return standardDeduction; }
    public void setStandardDeduction(BigDecimal standardDeduction) { this.standardDeduction = standardDeduction; }

    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }

    public BigDecimal getNetTaxableIncome() { return netTaxableIncome; }
    public void setNetTaxableIncome(BigDecimal netTaxableIncome) { this.netTaxableIncome = netTaxableIncome; }

    public List<SlabBreakdownItemDto> getSlabBreakdown() { return slabBreakdown; }
    public void setSlabBreakdown(List<SlabBreakdownItemDto> slabBreakdown) { this.slabBreakdown = slabBreakdown; }

    public BigDecimal getTaxBeforeRebate() { return taxBeforeRebate; }
    public void setTaxBeforeRebate(BigDecimal taxBeforeRebate) { this.taxBeforeRebate = taxBeforeRebate; }

    public BigDecimal getRebate87A() { return rebate87A; }
    public void setRebate87A(BigDecimal rebate87A) { this.rebate87A = rebate87A; }

    public BigDecimal getTaxAfterRebate() { return taxAfterRebate; }
    public void setTaxAfterRebate(BigDecimal taxAfterRebate) { this.taxAfterRebate = taxAfterRebate; }

    public BigDecimal getSurcharge() { return surcharge; }
    public void setSurcharge(BigDecimal surcharge) { this.surcharge = surcharge; }

    public BigDecimal getCess() { return cess; }
    public void setCess(BigDecimal cess) { this.cess = cess; }

    public BigDecimal getTotalTaxPayable() { return totalTaxPayable; }
    public void setTotalTaxPayable(BigDecimal totalTaxPayable) { this.totalTaxPayable = totalTaxPayable; }

    public BigDecimal getEffectiveTaxRatePercent() { return effectiveTaxRatePercent; }
    public void setEffectiveTaxRatePercent(BigDecimal effectiveTaxRatePercent) { this.effectiveTaxRatePercent = effectiveTaxRatePercent; }

    public MoneyAmount getGrossIncomeFormatted() { return grossIncomeFormatted; }
    public void setGrossIncomeFormatted(MoneyAmount grossIncomeFormatted) { this.grossIncomeFormatted = grossIncomeFormatted; }

    public MoneyAmount getStandardDeductionFormatted() { return standardDeductionFormatted; }
    public void setStandardDeductionFormatted(MoneyAmount standardDeductionFormatted) { this.standardDeductionFormatted = standardDeductionFormatted; }

    public MoneyAmount getTotalDeductionsFormatted() { return totalDeductionsFormatted; }
    public void setTotalDeductionsFormatted(MoneyAmount totalDeductionsFormatted) { this.totalDeductionsFormatted = totalDeductionsFormatted; }

    public MoneyAmount getNetTaxableIncomeFormatted() { return netTaxableIncomeFormatted; }
    public void setNetTaxableIncomeFormatted(MoneyAmount netTaxableIncomeFormatted) { this.netTaxableIncomeFormatted = netTaxableIncomeFormatted; }

    public MoneyAmount getTaxBeforeRebateFormatted() { return taxBeforeRebateFormatted; }
    public void setTaxBeforeRebateFormatted(MoneyAmount taxBeforeRebateFormatted) { this.taxBeforeRebateFormatted = taxBeforeRebateFormatted; }

    public MoneyAmount getRebate87AFormatted() { return rebate87AFormatted; }
    public void setRebate87AFormatted(MoneyAmount rebate87AFormatted) { this.rebate87AFormatted = rebate87AFormatted; }

    public MoneyAmount getCessFormatted() { return cessFormatted; }
    public void setCessFormatted(MoneyAmount cessFormatted) { this.cessFormatted = cessFormatted; }

    public MoneyAmount getTotalTaxPayableFormatted() { return totalTaxPayableFormatted; }
    public void setTotalTaxPayableFormatted(MoneyAmount totalTaxPayableFormatted) { this.totalTaxPayableFormatted = totalTaxPayableFormatted; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final RegimeTaxSummaryDto dto = new RegimeTaxSummaryDto();

        public Builder regimeName(String val) { dto.setRegimeName(val); return this; }
        public Builder grossTotalIncome(BigDecimal val) { dto.setGrossTotalIncome(val); return this; }
        public Builder standardDeduction(BigDecimal val) { dto.setStandardDeduction(val); return this; }
        public Builder totalDeductions(BigDecimal val) { dto.setTotalDeductions(val); return this; }
        public Builder netTaxableIncome(BigDecimal val) { dto.setNetTaxableIncome(val); return this; }
        public Builder slabBreakdown(List<SlabBreakdownItemDto> val) { dto.setSlabBreakdown(val); return this; }
        public Builder taxBeforeRebate(BigDecimal val) { dto.setTaxBeforeRebate(val); return this; }
        public Builder rebate87A(BigDecimal val) { dto.setRebate87A(val); return this; }
        public Builder taxAfterRebate(BigDecimal val) { dto.setTaxAfterRebate(val); return this; }
        public Builder surcharge(BigDecimal val) { dto.setSurcharge(val); return this; }
        public Builder cess(BigDecimal val) { dto.setCess(val); return this; }
        public Builder totalTaxPayable(BigDecimal val) { dto.setTotalTaxPayable(val); return this; }
        public Builder effectiveTaxRatePercent(BigDecimal val) { dto.setEffectiveTaxRatePercent(val); return this; }
        public Builder grossIncomeFormatted(MoneyAmount val) { dto.setGrossIncomeFormatted(val); return this; }
        public Builder standardDeductionFormatted(MoneyAmount val) { dto.setStandardDeductionFormatted(val); return this; }
        public Builder totalDeductionsFormatted(MoneyAmount val) { dto.setTotalDeductionsFormatted(val); return this; }
        public Builder netTaxableIncomeFormatted(MoneyAmount val) { dto.setNetTaxableIncomeFormatted(val); return this; }
        public Builder taxBeforeRebateFormatted(MoneyAmount val) { dto.setTaxBeforeRebateFormatted(val); return this; }
        public Builder rebate87AFormatted(MoneyAmount val) { dto.setRebate87AFormatted(val); return this; }
        public Builder cessFormatted(MoneyAmount val) { dto.setCessFormatted(val); return this; }
        public Builder totalTaxPayableFormatted(MoneyAmount val) { dto.setTotalTaxPayableFormatted(val); return this; }
        public RegimeTaxSummaryDto build() { return dto; }
    }
}
