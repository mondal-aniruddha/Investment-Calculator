package com.infinance.retirement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Schema(description = "Request payload for retirement corpus and glide-path planning")
public class RetirementRequestDto {

    @NotNull(message = "Current age is mandatory")
    @Min(value = 18, message = "Current age must be at least 18")
    @Max(value = 75, message = "Current age must be under 75")
    @Schema(description = "Current age in years", example = "30")
    private Integer currentAge;

    @NotNull(message = "Target retirement age is mandatory")
    @Min(value = 30, message = "Retirement age must be at least 30")
    @Max(value = 85, message = "Retirement age must be under 85")
    @Schema(description = "Target retirement age in years", example = "60")
    private Integer targetRetirementAge;

    @Min(value = 50, message = "Life expectancy must be at least 50")
    @Max(value = 100, message = "Life expectancy cannot exceed 100")
    @Schema(description = "Assumed life expectancy in years", example = "85")
    private Integer lifeExpectancy = 85;

    @NotNull(message = "Current monthly expenses are mandatory")
    @DecimalMin(value = "5000.00", message = "Monthly expenses must be at least ₹5,000")
    @Schema(description = "Current monthly living expenses in INR", example = "50000.00")
    private BigDecimal currentMonthlyExpenses;

    @DecimalMin(value = "0.00", message = "Existing corpus cannot be negative")
    @Schema(description = "Current accumulated retirement savings", example = "1000000.00")
    private BigDecimal existingRetirementCorpus = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "Monthly contribution cannot be negative")
    @Schema(description = "Current monthly investment towards retirement", example = "15000.00")
    private BigDecimal currentMonthlyContribution = BigDecimal.ZERO;

    @DecimalMin(value = "1.00", message = "Pre-retirement return must be at least 1%")
    @DecimalMax(value = "25.00", message = "Pre-retirement return cannot exceed 25%")
    @Schema(description = "Expected annual return during accumulation phase in percentage", example = "12.0")
    private BigDecimal expectedReturnPreRetirement;

    @DecimalMin(value = "1.00", message = "Post-retirement return must be at least 1%")
    @DecimalMax(value = "20.00", message = "Post-retirement return cannot exceed 20%")
    @Schema(description = "Expected annual return during retirement phase in percentage", example = "7.0")
    private BigDecimal expectedReturnPostRetirement;

    @DecimalMin(value = "1.00", message = "Inflation rate must be at least 1%")
    @DecimalMax(value = "15.00", message = "Inflation rate cannot exceed 15%")
    @Schema(description = "Expected long-term annual inflation rate in percentage", example = "6.0")
    private BigDecimal expectedInflationRate;

    @DecimalMin(value = "0.00", message = "Step-up percentage cannot be negative")
    @DecimalMax(value = "25.00", message = "Annual step-up cannot exceed 25%")
    @Schema(description = "Optional annual step-up percentage in monthly retirement savings", example = "5.0")
    private BigDecimal annualStepUpPercent = BigDecimal.ZERO;

    public RetirementRequestDto() {
    }

    public Integer getCurrentAge() { return currentAge; }
    public void setCurrentAge(Integer currentAge) { this.currentAge = currentAge; }

    public Integer getTargetRetirementAge() { return targetRetirementAge; }
    public void setTargetRetirementAge(Integer targetRetirementAge) { this.targetRetirementAge = targetRetirementAge; }

    public Integer getLifeExpectancy() { return lifeExpectancy; }
    public void setLifeExpectancy(Integer lifeExpectancy) { this.lifeExpectancy = lifeExpectancy; }

    public BigDecimal getCurrentMonthlyExpenses() { return currentMonthlyExpenses; }
    public void setCurrentMonthlyExpenses(BigDecimal currentMonthlyExpenses) { this.currentMonthlyExpenses = currentMonthlyExpenses; }

    public BigDecimal getExistingRetirementCorpus() { return existingRetirementCorpus; }
    public void setExistingRetirementCorpus(BigDecimal existingRetirementCorpus) { this.existingRetirementCorpus = existingRetirementCorpus; }

    public BigDecimal getCurrentMonthlyContribution() { return currentMonthlyContribution; }
    public void setCurrentMonthlyContribution(BigDecimal currentMonthlyContribution) { this.currentMonthlyContribution = currentMonthlyContribution; }

    public BigDecimal getExpectedReturnPreRetirement() { return expectedReturnPreRetirement; }
    public void setExpectedReturnPreRetirement(BigDecimal expectedReturnPreRetirement) { this.expectedReturnPreRetirement = expectedReturnPreRetirement; }

    public BigDecimal getExpectedReturnPostRetirement() { return expectedReturnPostRetirement; }
    public void setExpectedReturnPostRetirement(BigDecimal expectedReturnPostRetirement) { this.expectedReturnPostRetirement = expectedReturnPostRetirement; }

    public BigDecimal getExpectedInflationRate() { return expectedInflationRate; }
    public void setExpectedInflationRate(BigDecimal expectedInflationRate) { this.expectedInflationRate = expectedInflationRate; }

    public BigDecimal getAnnualStepUpPercent() { return annualStepUpPercent; }
    public void setAnnualStepUpPercent(BigDecimal annualStepUpPercent) { this.annualStepUpPercent = annualStepUpPercent; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final RetirementRequestDto dto = new RetirementRequestDto();

        public Builder currentAge(Integer val) { dto.setCurrentAge(val); return this; }
        public Builder targetRetirementAge(Integer val) { dto.setTargetRetirementAge(val); return this; }
        public Builder lifeExpectancy(Integer val) { dto.setLifeExpectancy(val); return this; }
        public Builder currentMonthlyExpenses(BigDecimal val) { dto.setCurrentMonthlyExpenses(val); return this; }
        public Builder existingRetirementCorpus(BigDecimal val) { dto.setExistingRetirementCorpus(val); return this; }
        public Builder currentMonthlyContribution(BigDecimal val) { dto.setCurrentMonthlyContribution(val); return this; }
        public Builder expectedReturnPreRetirement(BigDecimal val) { dto.setExpectedReturnPreRetirement(val); return this; }
        public Builder expectedReturnPostRetirement(BigDecimal val) { dto.setExpectedReturnPostRetirement(val); return this; }
        public Builder expectedInflationRate(BigDecimal val) { dto.setExpectedInflationRate(val); return this; }
        public Builder annualStepUpPercent(BigDecimal val) { dto.setAnnualStepUpPercent(val); return this; }
        public RetirementRequestDto build() { return dto; }
    }
}
