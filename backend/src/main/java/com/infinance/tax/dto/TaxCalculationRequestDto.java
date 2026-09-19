package com.infinance.tax.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Schema(description = "Request payload for Income Tax calculation comparing Old and New regimes")
public class TaxCalculationRequestDto {

    @Schema(description = "Financial Year (e.g. 2024-2025)", example = "2024-2025")
    private String financialYear;

    @Schema(description = "Age category: NORMAL_BELOW_60, SENIOR_60_TO_80, SUPER_SENIOR_ABOVE_80", example = "NORMAL_BELOW_60")
    private String ageCategory = "NORMAL_BELOW_60";

    @NotNull(message = "Gross annual salary is mandatory")
    @DecimalMin(value = "0.00", message = "Salary cannot be negative")
    @DecimalMax(value = "1000000000.00", message = "Salary limit exceeded")
    @Schema(description = "Gross annual salary before standard deduction", example = "1500000.00")
    private BigDecimal grossSalary;

    @DecimalMin(value = "0.00", message = "Income from other sources cannot be negative")
    @Schema(description = "Interest, dividends, savings bank interest etc.", example = "50000.00")
    private BigDecimal incomeFromOtherSources = BigDecimal.ZERO;

    @Schema(description = "Income or loss from house property", example = "0.00")
    private BigDecimal incomeFromHouseProperty = BigDecimal.ZERO;

    // Deductions (Old Regime)
    @DecimalMin(value = "0.00", message = "Section 80C cannot be negative")
    @Schema(description = "Section 80C investments capped at ₹1,50,000", example = "150000.00")
    private BigDecimal section80C = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "Section 80D cannot be negative")
    @Schema(description = "Section 80D health insurance premiums", example = "25000.00")
    private BigDecimal section80DMedicalInsurance = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "NPS 80CCD(1B) cannot be negative")
    @Schema(description = "Additional NPS deduction u/s 80CCD(1B) capped at ₹50,000", example = "50000.00")
    private BigDecimal section80CCD1BNps = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "HRA exemption cannot be negative")
    @Schema(description = "House Rent Allowance (HRA) exemption under Section 10(13A)", example = "0.00")
    private BigDecimal hraExemption = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "Home loan interest cannot be negative")
    @Schema(description = "Self-occupied home loan interest u/s 24(b) capped at ₹2,00,000", example = "0.00")
    private BigDecimal homeLoanInterestSection24b = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "Other deductions cannot be negative")
    @Schema(description = "Other Chapter VI-A deductions", example = "0.00")
    private BigDecimal otherDeductionsChapterVIA = BigDecimal.ZERO;

    public TaxCalculationRequestDto() {
    }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public String getAgeCategory() { return ageCategory; }
    public void setAgeCategory(String ageCategory) { this.ageCategory = ageCategory; }

    public BigDecimal getGrossSalary() { return grossSalary; }
    public void setGrossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary; }

    public BigDecimal getIncomeFromOtherSources() { return incomeFromOtherSources; }
    public void setIncomeFromOtherSources(BigDecimal incomeFromOtherSources) { this.incomeFromOtherSources = incomeFromOtherSources; }

    public BigDecimal getIncomeFromHouseProperty() { return incomeFromHouseProperty; }
    public void setIncomeFromHouseProperty(BigDecimal incomeFromHouseProperty) { this.incomeFromHouseProperty = incomeFromHouseProperty; }

    public BigDecimal getSection80C() { return section80C; }
    public void setSection80C(BigDecimal section80C) { this.section80C = section80C; }

    public BigDecimal getSection80DMedicalInsurance() { return section80DMedicalInsurance; }
    public void setSection80DMedicalInsurance(BigDecimal section80DMedicalInsurance) { this.section80DMedicalInsurance = section80DMedicalInsurance; }

    public BigDecimal getSection80CCD1BNps() { return section80CCD1BNps; }
    public void setSection80CCD1BNps(BigDecimal section80CCD1BNps) { this.section80CCD1BNps = section80CCD1BNps; }

    public BigDecimal getHraExemption() { return hraExemption; }
    public void setHraExemption(BigDecimal hraExemption) { this.hraExemption = hraExemption; }

    public BigDecimal getHomeLoanInterestSection24b() { return homeLoanInterestSection24b; }
    public void setHomeLoanInterestSection24b(BigDecimal homeLoanInterestSection24b) { this.homeLoanInterestSection24b = homeLoanInterestSection24b; }

    public BigDecimal getOtherDeductionsChapterVIA() { return otherDeductionsChapterVIA; }
    public void setOtherDeductionsChapterVIA(BigDecimal otherDeductionsChapterVIA) { this.otherDeductionsChapterVIA = otherDeductionsChapterVIA; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final TaxCalculationRequestDto dto = new TaxCalculationRequestDto();

        public Builder financialYear(String val) { dto.setFinancialYear(val); return this; }
        public Builder ageCategory(String val) { dto.setAgeCategory(val); return this; }
        public Builder grossSalary(BigDecimal val) { dto.setGrossSalary(val); return this; }
        public Builder incomeFromOtherSources(BigDecimal val) { dto.setIncomeFromOtherSources(val); return this; }
        public Builder incomeFromHouseProperty(BigDecimal val) { dto.setIncomeFromHouseProperty(val); return this; }
        public Builder section80C(BigDecimal val) { dto.setSection80C(val); return this; }
        public Builder section80DMedicalInsurance(BigDecimal val) { dto.setSection80DMedicalInsurance(val); return this; }
        public Builder section80CCD1BNps(BigDecimal val) { dto.setSection80CCD1BNps(val); return this; }
        public Builder hraExemption(BigDecimal val) { dto.setHraExemption(val); return this; }
        public Builder homeLoanInterestSection24b(BigDecimal val) { dto.setHomeLoanInterestSection24b(val); return this; }
        public Builder otherDeductionsChapterVIA(BigDecimal val) { dto.setOtherDeductionsChapterVIA(val); return this; }
        public TaxCalculationRequestDto build() { return dto; }
    }
}
