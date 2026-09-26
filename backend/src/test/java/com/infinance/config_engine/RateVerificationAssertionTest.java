package com.infinance.config_engine;

import com.infinance.common.config.FinancialProperties;
import com.infinance.config_engine.service.AssumptionService;
import com.infinance.tax.dto.TaxSlabDto;
import com.infinance.tax.engine.IncomeTaxEngine;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Task 28 Verification Guard: Asserts that all loaded financial assumptions,
 * statutory tax slabs, deduction limits, and small savings rates match
 * project-details/rate-verification-2026-09-26.md exactly.
 */
@SpringBootTest
class RateVerificationAssertionTest {

    @Autowired
    private FinancialProperties properties;

    private static void assertBigDecimalEquals(BigDecimal expected, BigDecimal actual, String message) {
        assertNotNull(actual, message + " (actual was null)");
        assertEquals(0, expected.compareTo(actual),
                String.format("%s: expected <%s> but was <%s>", message, expected, actual));
    }

    private static void assertBigDecimalEquals(BigDecimal expected, BigDecimal actual) {
        assertBigDecimalEquals(expected, actual, "BigDecimal comparison mismatch");
    }

    @Test
    @DisplayName("Verify Income Tax New Regime parameters match Finance (No. 2) Act 2024")
    void testTaxNewRegimeMatchesVerificationReport() {
        assertEquals("2024-2025", properties.getCurrentFinancialYear());

        FinancialProperties.TaxYearConfig taxConfig = properties.getTax().get("2024-2025");
        assertNotNull(taxConfig, "Tax configuration for 2024-2025 must be present");
        assertEquals("2025-2026", taxConfig.getAssessmentYear());
        assertBigDecimalEquals(new BigDecimal("4.00"), taxConfig.getCessPercent(), "Cess percent");

        FinancialProperties.RegimeConfig newRegime = taxConfig.getNewRegime();
        assertBigDecimalEquals(new BigDecimal("75000.00"), newRegime.getStandardDeduction(), "New regime standard deduction");
        assertBigDecimalEquals(new BigDecimal("700000.00"), newRegime.getRebate87aMaxIncome(), "87A max income");
        assertBigDecimalEquals(new BigDecimal("25000.00"), newRegime.getRebate87aMaxAmount(), "87A max rebate");

        // Verify Engine constants match
        assertBigDecimalEquals(new BigDecimal("75000.00"), IncomeTaxEngine.STD_DEDUCTION_NEW_REGIME, "Engine standard deduction new");
        assertBigDecimalEquals(new BigDecimal("700000.00"), IncomeTaxEngine.REBATE_87A_LIMIT_NEW, "Engine rebate limit new");
        assertBigDecimalEquals(new BigDecimal("25000.00"), IncomeTaxEngine.REBATE_87A_MAX_NEW, "Engine rebate max new");

        // Verify 6 slabs under New Regime (Section 115BAC)
        List<FinancialProperties.SlabItemConfig> slabs = newRegime.getSlabs();
        assertEquals(6, slabs.size());
        assertBigDecimalEquals(new BigDecimal("0.00"), slabs.get(0).getRate());
        assertBigDecimalEquals(new BigDecimal("300000.00"), slabs.get(0).getMax());
        assertBigDecimalEquals(new BigDecimal("5.00"), slabs.get(1).getRate());
        assertBigDecimalEquals(new BigDecimal("700000.00"), slabs.get(1).getMax());
        assertBigDecimalEquals(new BigDecimal("10.00"), slabs.get(2).getRate());
        assertBigDecimalEquals(new BigDecimal("1000000.00"), slabs.get(2).getMax());
        assertBigDecimalEquals(new BigDecimal("15.00"), slabs.get(3).getRate());
        assertBigDecimalEquals(new BigDecimal("1200000.00"), slabs.get(3).getMax());
        assertBigDecimalEquals(new BigDecimal("20.00"), slabs.get(4).getRate());
        assertBigDecimalEquals(new BigDecimal("1500000.00"), slabs.get(4).getMax());
        assertBigDecimalEquals(new BigDecimal("30.00"), slabs.get(5).getRate());
        assertNull(slabs.get(5).getMax());
    }

    @Test
    @DisplayName("Verify Income Tax Old Regime parameters match Income Tax Act 1961")
    void testTaxOldRegimeMatchesVerificationReport() {
        FinancialProperties.TaxYearConfig taxConfig = properties.getTax().get("2024-2025");
        assertNotNull(taxConfig);

        FinancialProperties.RegimeConfig oldRegime = taxConfig.getOldRegime();
        assertBigDecimalEquals(new BigDecimal("50000.00"), oldRegime.getStandardDeduction(), "Old regime standard deduction");
        assertBigDecimalEquals(new BigDecimal("500000.00"), oldRegime.getRebate87aMaxIncome(), "Old regime rebate 87A income");
        assertBigDecimalEquals(new BigDecimal("12500.00"), oldRegime.getRebate87aMaxAmount(), "Old regime rebate 87A amount");

        assertBigDecimalEquals(new BigDecimal("150000.00"), oldRegime.getSection80cLimit(), "80C limit");
        assertBigDecimalEquals(new BigDecimal("50000.00"), oldRegime.getSection80ccd1bLimit(), "80CCD(1B) limit");
        assertBigDecimalEquals(new BigDecimal("200000.00"), oldRegime.getSection24bSelfOccupiedLimit(), "24(b) limit");
        assertBigDecimalEquals(new BigDecimal("25000.00"), oldRegime.getSection80dSelfFamilyLimit(), "80D self limit");
        assertBigDecimalEquals(new BigDecimal("50000.00"), oldRegime.getSection80dParentsSeniorLimit(), "80D parents limit");

        // Verify Engine constants match
        assertBigDecimalEquals(new BigDecimal("50000.00"), IncomeTaxEngine.STD_DEDUCTION_OLD_REGIME);
        assertBigDecimalEquals(new BigDecimal("500000.00"), IncomeTaxEngine.REBATE_87A_LIMIT_OLD);
        assertBigDecimalEquals(new BigDecimal("12500.00"), IncomeTaxEngine.REBATE_87A_MAX_OLD);
        assertBigDecimalEquals(new BigDecimal("150000.00"), IncomeTaxEngine.CAP_SECTION_80C);
        assertBigDecimalEquals(new BigDecimal("50000.00"), IncomeTaxEngine.CAP_SECTION_80CCD_1B);
        assertBigDecimalEquals(new BigDecimal("200000.00"), IncomeTaxEngine.CAP_SECTION_24B_SELF_OCCUPIED);

        // Verify default Old Regime slabs
        List<TaxSlabDto> oldSlabs = IncomeTaxEngine.getDefaultOldRegimeSlabs("NORMAL_BELOW_60");
        assertEquals(4, oldSlabs.size());
        assertBigDecimalEquals(new BigDecimal("250000.00"), oldSlabs.get(0).max());
        assertBigDecimalEquals(BigDecimal.ZERO, oldSlabs.get(0).ratePercent());
        assertBigDecimalEquals(new BigDecimal("5.00"), oldSlabs.get(1).ratePercent());
        assertBigDecimalEquals(new BigDecimal("20.00"), oldSlabs.get(2).ratePercent());
        assertBigDecimalEquals(new BigDecimal("30.00"), oldSlabs.get(3).ratePercent());
    }

    @Test
    @DisplayName("Verify Government Small Savings Scheme rates match MoF & EPFO notifications")
    void testGovernmentSchemesMatchVerificationReport() {
        FinancialProperties.GovernmentSchemesConfig schemes = properties.getRates().getGovernmentSchemes();

        assertBigDecimalEquals(new BigDecimal("7.10"), schemes.getPpfRate(), "PPF rate must be 7.10% per MoF DEA notification");
        assertBigDecimalEquals(new BigDecimal("500"), schemes.getPpfMinAnnual());
        assertBigDecimalEquals(new BigDecimal("150000"), schemes.getPpfMaxAnnual());
        assertEquals(15, schemes.getPpfLockInYears());

        assertBigDecimalEquals(new BigDecimal("8.20"), schemes.getSsyRate(), "SSY rate must be 8.20% per MoF Dec 2023 notification");
        assertBigDecimalEquals(new BigDecimal("150000"), schemes.getSsyMaxAnnual());
        assertEquals(10, schemes.getSsyMaxAge());

        assertBigDecimalEquals(new BigDecimal("8.20"), schemes.getScssRate(), "SCSS rate must be 8.20% per MoF notification");
        assertBigDecimalEquals(new BigDecimal("8.25"), schemes.getEpfRate(), "EPF rate must be 8.25% per CBT EPFO notification");
        assertBigDecimalEquals(new BigDecimal("10.50"), schemes.getNpsExpectedCagr(), "NPS expected CAGR benchmark is 10.50%");

        assertBigDecimalEquals(new BigDecimal("7.50"), schemes.getPostOfficeTimeDepositRate(), "5-yr POTD must be 7.50% p.a.");
        assertBigDecimalEquals(new BigDecimal("7.40"), schemes.getPostOfficeMonthlyIncomeRate(), "POMIS must be 7.40% p.a.");
        assertBigDecimalEquals(new BigDecimal("6.70"), schemes.getRdRate(), "Post Office 5-yr RD must be 6.70% p.a.");

        assertBigDecimalEquals(new BigDecimal("7.00"), schemes.getFdRate(), "FD benchmark is 7.00% p.a.");
        assertBigDecimalEquals(new BigDecimal("6.75"), schemes.getSweepInFdRate(), "Sweep-in FD benchmark is 6.75% p.a.");
        assertBigDecimalEquals(new BigDecimal("3.50"), schemes.getSavingsAccountRate(), "Savings account benchmark is 3.50% p.a.");
    }

    @Test
    @DisplayName("Verify Market Benchmarks and Loans match verified report values")
    void testMarketBenchmarksMatchVerificationReport() {
        FinancialProperties.MarketBenchmarksConfig benchmarks = properties.getRates().getMarketBenchmarks();

        assertBigDecimalEquals(new BigDecimal("12.00"), benchmarks.getEquityNiftyCagr(), "Nifty 50 CAGR benchmark is 12.00%");
        assertBigDecimalEquals(new BigDecimal("10.00"), benchmarks.getEquityConservativeCagr());
        assertBigDecimalEquals(new BigDecimal("14.00"), benchmarks.getEquityAggressiveCagr());
        assertBigDecimalEquals(new BigDecimal("7.50"), benchmarks.getDebtHybridCagr());
        assertBigDecimalEquals(new BigDecimal("9.00"), benchmarks.getGoldCagr());
        assertBigDecimalEquals(new BigDecimal("42.00"), benchmarks.getCreditCardTypicalApr(), "Card APR benchmark is 42.00% (3.5%/month)");
        assertBigDecimalEquals(new BigDecimal("13.50"), benchmarks.getPersonalLoanConsolidationApr());
    }

    @Test
    @DisplayName("Verify Inflation rates match RBI tolerance and industry benchmarks")
    void testInflationRatesMatchVerificationReport() {
        FinancialProperties.InflationConfig inflation = properties.getRates().getInflation();

        assertBigDecimalEquals(new BigDecimal("6.00"), inflation.getCpiGeneralRate(), "General CPI baseline is 6.00% (RBI tolerance upper bound)");
        assertBigDecimalEquals(new BigDecimal("10.00"), inflation.getEducationInflationRate(), "Education inflation benchmark is 10.00%");
        assertBigDecimalEquals(new BigDecimal("12.00"), inflation.getHealthcareInflationRate(), "Healthcare inflation benchmark is 12.00%");
    }
}
