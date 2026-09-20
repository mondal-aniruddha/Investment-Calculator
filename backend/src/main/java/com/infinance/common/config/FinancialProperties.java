package com.infinance.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ConfigurationProperties(prefix = "infinance")
public class FinancialProperties {

    private String disclaimer = "For educational purposes only; not investment, tax, or legal advice. Consult a SEBI-registered advisor or a Chartered Accountant.";
    private String currentFinancialYear = "2024-2025";
    private RatesConfig rates = new RatesConfig();
    private Map<String, TaxYearConfig> tax = new HashMap<>();

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }

    public String getCurrentFinancialYear() {
        return currentFinancialYear;
    }

    public void setCurrentFinancialYear(String currentFinancialYear) {
        this.currentFinancialYear = currentFinancialYear;
    }

    public RatesConfig getRates() {
        return rates;
    }

    public void setRates(RatesConfig rates) {
        this.rates = rates;
    }

    public Map<String, TaxYearConfig> getTax() {
        return tax;
    }

    public void setTax(Map<String, TaxYearConfig> tax) {
        this.tax = tax;
    }

    public static class RatesConfig {
        private GovernmentSchemesConfig governmentSchemes = new GovernmentSchemesConfig();
        private MarketBenchmarksConfig marketBenchmarks = new MarketBenchmarksConfig();
        private InflationConfig inflation = new InflationConfig();

        public GovernmentSchemesConfig getGovernmentSchemes() {
            return governmentSchemes;
        }

        public void setGovernmentSchemes(GovernmentSchemesConfig governmentSchemes) {
            this.governmentSchemes = governmentSchemes;
        }

        public MarketBenchmarksConfig getMarketBenchmarks() {
            return marketBenchmarks;
        }

        public void setMarketBenchmarks(MarketBenchmarksConfig marketBenchmarks) {
            this.marketBenchmarks = marketBenchmarks;
        }

        public InflationConfig getInflation() {
            return inflation;
        }

        public void setInflation(InflationConfig inflation) {
            this.inflation = inflation;
        }
    }

    public static class GovernmentSchemesConfig {
        private BigDecimal ppfRate = new BigDecimal("7.10");
        private BigDecimal ppfMinAnnual = new BigDecimal("500");
        private BigDecimal ppfMaxAnnual = new BigDecimal("150000");
        private Integer ppfLockInYears = 15;
        private BigDecimal ssyRate = new BigDecimal("8.20");
        private BigDecimal ssyMaxAnnual = new BigDecimal("150000");
        private Integer ssyMaxAge = 10;
        private BigDecimal scssRate = new BigDecimal("8.20");
        private BigDecimal epfRate = new BigDecimal("8.25");
        private BigDecimal npsExpectedCagr = new BigDecimal("10.50");
        private BigDecimal sweepInFdRate = new BigDecimal("6.75");
        private BigDecimal savingsAccountRate = new BigDecimal("3.50");
        private BigDecimal fdRate = new BigDecimal("7.00");
        private BigDecimal rdRate = new BigDecimal("6.75");
        private BigDecimal postOfficeTimeDepositRate = new BigDecimal("7.50");
        private BigDecimal postOfficeMonthlyIncomeRate = new BigDecimal("7.40");

        public BigDecimal getPpfRate() { return ppfRate; }
        public void setPpfRate(BigDecimal ppfRate) { this.ppfRate = ppfRate; }
        public BigDecimal getPpfMinAnnual() { return ppfMinAnnual; }
        public void setPpfMinAnnual(BigDecimal ppfMinAnnual) { this.ppfMinAnnual = ppfMinAnnual; }
        public BigDecimal getPpfMaxAnnual() { return ppfMaxAnnual; }
        public void setPpfMaxAnnual(BigDecimal ppfMaxAnnual) { this.ppfMaxAnnual = ppfMaxAnnual; }
        public Integer getPpfLockInYears() { return ppfLockInYears; }
        public void setPpfLockInYears(Integer ppfLockInYears) { this.ppfLockInYears = ppfLockInYears; }
        public BigDecimal getSsyRate() { return ssyRate; }
        public void setSsyRate(BigDecimal ssyRate) { this.ssyRate = ssyRate; }
        public BigDecimal getSsyMaxAnnual() { return ssyMaxAnnual; }
        public void setSsyMaxAnnual(BigDecimal ssyMaxAnnual) { this.ssyMaxAnnual = ssyMaxAnnual; }
        public Integer getSsyMaxAge() { return ssyMaxAge; }
        public void setSsyMaxAge(Integer ssyMaxAge) { this.ssyMaxAge = ssyMaxAge; }
        public BigDecimal getScssRate() { return scssRate; }
        public void setScssRate(BigDecimal scssRate) { this.scssRate = scssRate; }
        public BigDecimal getEpfRate() { return epfRate; }
        public void setEpfRate(BigDecimal epfRate) { this.epfRate = epfRate; }
        public BigDecimal getNpsExpectedCagr() { return npsExpectedCagr; }
        public void setNpsExpectedCagr(BigDecimal npsExpectedCagr) { this.npsExpectedCagr = npsExpectedCagr; }
        public BigDecimal getSweepInFdRate() { return sweepInFdRate; }
        public void setSweepInFdRate(BigDecimal sweepInFdRate) { this.sweepInFdRate = sweepInFdRate; }
        public BigDecimal getSavingsAccountRate() { return savingsAccountRate; }
        public void setSavingsAccountRate(BigDecimal savingsAccountRate) { this.savingsAccountRate = savingsAccountRate; }
        public BigDecimal getFdRate() { return fdRate; }
        public void setFdRate(BigDecimal fdRate) { this.fdRate = fdRate; }
        public BigDecimal getRdRate() { return rdRate; }
        public void setRdRate(BigDecimal rdRate) { this.rdRate = rdRate; }
        public BigDecimal getPostOfficeTimeDepositRate() { return postOfficeTimeDepositRate; }
        public void setPostOfficeTimeDepositRate(BigDecimal postOfficeTimeDepositRate) { this.postOfficeTimeDepositRate = postOfficeTimeDepositRate; }
        public BigDecimal getPostOfficeMonthlyIncomeRate() { return postOfficeMonthlyIncomeRate; }
        public void setPostOfficeMonthlyIncomeRate(BigDecimal postOfficeMonthlyIncomeRate) { this.postOfficeMonthlyIncomeRate = postOfficeMonthlyIncomeRate; }
    }

    public static class MarketBenchmarksConfig {
        private BigDecimal equityNiftyCagr = new BigDecimal("12.00");
        private BigDecimal equityConservativeCagr = new BigDecimal("10.00");
        private BigDecimal equityAggressiveCagr = new BigDecimal("14.00");
        private BigDecimal debtHybridCagr = new BigDecimal("7.50");
        private BigDecimal goldCagr = new BigDecimal("9.00");
        private BigDecimal creditCardTypicalApr = new BigDecimal("42.00");
        private BigDecimal personalLoanConsolidationApr = new BigDecimal("13.50");

        public BigDecimal getEquityNiftyCagr() { return equityNiftyCagr; }
        public void setEquityNiftyCagr(BigDecimal equityNiftyCagr) { this.equityNiftyCagr = equityNiftyCagr; }
        public BigDecimal getEquityConservativeCagr() { return equityConservativeCagr; }
        public void setEquityConservativeCagr(BigDecimal equityConservativeCagr) { this.equityConservativeCagr = equityConservativeCagr; }
        public BigDecimal getEquityAggressiveCagr() { return equityAggressiveCagr; }
        public void setEquityAggressiveCagr(BigDecimal equityAggressiveCagr) { this.equityAggressiveCagr = equityAggressiveCagr; }
        public BigDecimal getDebtHybridCagr() { return debtHybridCagr; }
        public void setDebtHybridCagr(BigDecimal debtHybridCagr) { this.debtHybridCagr = debtHybridCagr; }
        public BigDecimal getGoldCagr() { return goldCagr; }
        public void setGoldCagr(BigDecimal goldCagr) { this.goldCagr = goldCagr; }
        public BigDecimal getCreditCardTypicalApr() { return creditCardTypicalApr; }
        public void setCreditCardTypicalApr(BigDecimal creditCardTypicalApr) { this.creditCardTypicalApr = creditCardTypicalApr; }
        public BigDecimal getPersonalLoanConsolidationApr() { return personalLoanConsolidationApr; }
        public void setPersonalLoanConsolidationApr(BigDecimal personalLoanConsolidationApr) { this.personalLoanConsolidationApr = personalLoanConsolidationApr; }
    }

    public static class InflationConfig {
        private BigDecimal cpiGeneralRate = new BigDecimal("6.00");
        private BigDecimal educationInflationRate = new BigDecimal("10.00");
        private BigDecimal healthcareInflationRate = new BigDecimal("12.00");

        public BigDecimal getCpiGeneralRate() { return cpiGeneralRate; }
        public void setCpiGeneralRate(BigDecimal cpiGeneralRate) { this.cpiGeneralRate = cpiGeneralRate; }
        public BigDecimal getEducationInflationRate() { return educationInflationRate; }
        public void setEducationInflationRate(BigDecimal educationInflationRate) { this.educationInflationRate = educationInflationRate; }
        public BigDecimal getHealthcareInflationRate() { return healthcareInflationRate; }
        public void setHealthcareInflationRate(BigDecimal healthcareInflationRate) { this.healthcareInflationRate = healthcareInflationRate; }
    }

    public static class TaxYearConfig {
        private String financialYear;
        private String assessmentYear;
        private BigDecimal cessPercent = new BigDecimal("4.00");
        private RegimeConfig newRegime = new RegimeConfig();
        private RegimeConfig oldRegime = new RegimeConfig();

        public String getFinancialYear() { return financialYear; }
        public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }
        public String getAssessmentYear() { return assessmentYear; }
        public void setAssessmentYear(String assessmentYear) { this.assessmentYear = assessmentYear; }
        public BigDecimal getCessPercent() { return cessPercent; }
        public void setCessPercent(BigDecimal cessPercent) { this.cessPercent = cessPercent; }
        public RegimeConfig getNewRegime() { return newRegime; }
        public void setNewRegime(RegimeConfig newRegime) { this.newRegime = newRegime; }
        public RegimeConfig getOldRegime() { return oldRegime; }
        public void setOldRegime(RegimeConfig oldRegime) { this.oldRegime = oldRegime; }
    }

    public static class RegimeConfig {
        private BigDecimal standardDeduction = BigDecimal.ZERO;
        private BigDecimal rebate87aMaxIncome = BigDecimal.ZERO;
        private BigDecimal rebate87aMaxAmount = BigDecimal.ZERO;
        private BigDecimal section80cLimit = BigDecimal.ZERO;
        private BigDecimal section80ccd1bLimit = BigDecimal.ZERO;
        private BigDecimal section24bSelfOccupiedLimit = BigDecimal.ZERO;
        private BigDecimal section80dSelfFamilyLimit = BigDecimal.ZERO;
        private BigDecimal section80dParentsSeniorLimit = BigDecimal.ZERO;
        private List<SlabItemConfig> slabs = new ArrayList<>();

        public BigDecimal getStandardDeduction() { return standardDeduction; }
        public void setStandardDeduction(BigDecimal standardDeduction) { this.standardDeduction = standardDeduction; }
        public BigDecimal getRebate87aMaxIncome() { return rebate87aMaxIncome; }
        public void setRebate87aMaxIncome(BigDecimal rebate87aMaxIncome) { this.rebate87aMaxIncome = rebate87aMaxIncome; }
        public BigDecimal getRebate87aMaxAmount() { return rebate87aMaxAmount; }
        public void setRebate87aMaxAmount(BigDecimal rebate87aMaxAmount) { this.rebate87aMaxAmount = rebate87aMaxAmount; }
        public BigDecimal getSection80cLimit() { return section80cLimit; }
        public void setSection80cLimit(BigDecimal section80cLimit) { this.section80cLimit = section80cLimit; }
        public BigDecimal getSection80ccd1bLimit() { return section80ccd1bLimit; }
        public void setSection80ccd1bLimit(BigDecimal section80ccd1bLimit) { this.section80ccd1bLimit = section80ccd1bLimit; }
        public BigDecimal getSection24bSelfOccupiedLimit() { return section24bSelfOccupiedLimit; }
        public void setSection24bSelfOccupiedLimit(BigDecimal section24bSelfOccupiedLimit) { this.section24bSelfOccupiedLimit = section24bSelfOccupiedLimit; }
        public BigDecimal getSection80dSelfFamilyLimit() { return section80dSelfFamilyLimit; }
        public void setSection80dSelfFamilyLimit(BigDecimal section80dSelfFamilyLimit) { this.section80dSelfFamilyLimit = section80dSelfFamilyLimit; }
        public BigDecimal getSection80dParentsSeniorLimit() { return section80dParentsSeniorLimit; }
        public void setSection80dParentsSeniorLimit(BigDecimal section80dParentsSeniorLimit) { this.section80dParentsSeniorLimit = section80dParentsSeniorLimit; }
        public List<SlabItemConfig> getSlabs() { return slabs; }
        public void setSlabs(List<SlabItemConfig> slabs) { this.slabs = slabs; }
    }

    public static class SlabItemConfig {
        private BigDecimal min;
        private BigDecimal max;
        private BigDecimal rate;

        public BigDecimal getMin() { return min; }
        public void setMin(BigDecimal min) { this.min = min; }
        public BigDecimal getMax() { return max; }
        public void setMax(BigDecimal max) { this.max = max; }
        public BigDecimal getRate() { return rate; }
        public void setRate(BigDecimal rate) { this.rate = rate; }
    }
}
