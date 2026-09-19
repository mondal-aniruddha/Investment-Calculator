package com.infinance.tax.engine;

import com.infinance.tax.dto.RegimeTaxSummaryDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class IncomeTaxEngineTest {

    /**
     * Hand-worked Case 1:
     * Gross Salary = ₹7,75,000 under New Regime (FY 2024-25)
     * Standard deduction = ₹75,000
     * Taxable Income = ₹7,00,000
     * Slabs:
     * - 0 to 3L: ₹0
     * - 3L to 7L: 4,00,000 * 5% = ₹20,000
     * Total tax before rebate = ₹20,000
     * Section 87A Rebate: Since taxable income <= ₹7,00,000, rebate = ₹20,000
     * Tax after rebate = ₹0.00
     * Cess = ₹0.00
     * Total Tax Payable = ₹0.00
     */
    @Test
    @DisplayName("Hand-verified: Gross Salary ₹7.75 Lakhs under New Regime pays ZERO tax due to 87A rebate")
    void testNewRegimeFullRebateUnderSevenLakhs() {
        IncomeTaxEngine.TaxComputationInput input = new IncomeTaxEngine.TaxComputationInput(
                new BigDecimal("775000.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "NORMAL_BELOW_60",
                null,
                null,
                IncomeTaxEngine.STD_DEDUCTION_NEW_REGIME,
                IncomeTaxEngine.STD_DEDUCTION_OLD_REGIME
        );

        RegimeTaxSummaryDto result = IncomeTaxEngine.calculateNewRegime(input);

        assertThat(result.getStandardDeduction()).isEqualByComparingTo(new BigDecimal("75000.00"));
        assertThat(result.getNetTaxableIncome()).isEqualByComparingTo(new BigDecimal("700000.00"));
        assertThat(result.getTaxBeforeRebate()).isEqualByComparingTo(new BigDecimal("20000.00"));
        assertThat(result.getRebate87A()).isEqualByComparingTo(new BigDecimal("20000.00"));
        assertThat(result.getTotalTaxPayable()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getEffectiveTaxRatePercent()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    /**
     * Hand-worked Case 2:
     * Gross Salary = ₹15,75,000 under New Regime (FY 2024-25)
     * Standard deduction = ₹75,000
     * Taxable Income = ₹15,00,000
     * Slabs:
     * - 0 to 3L (0%): ₹0
     * - 3L to 7L (5% on 4L): ₹20,000
     * - 7L to 10L (10% on 3L): ₹30,000
     * - 10L to 12L (15% on 2L): ₹30,000
     * - 12L to 15L (20% on 3L): ₹60,000
     * Tax Before Rebate = 20,000 + 30,000 + 30,000 + 60,000 = ₹1,40,000
     * Rebate 87A = ₹0 (income > 7L)
     * Surcharge = ₹0 (income <= 50L)
     * Cess (4% of 1,40,000) = ₹5,600
     * Total Tax = ₹1,45,600
     * Effective Tax Rate = 1,45,600 / 15,75,000 = 9.24%
     */
    @Test
    @DisplayName("Hand-verified: Gross Salary ₹15.75 Lakhs under New Regime results in ₹1,45,600 tax")
    void testNewRegimeFifteenLakhTaxable() {
        IncomeTaxEngine.TaxComputationInput input = new IncomeTaxEngine.TaxComputationInput(
                new BigDecimal("1575000.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "NORMAL_BELOW_60",
                null,
                null,
                IncomeTaxEngine.STD_DEDUCTION_NEW_REGIME,
                IncomeTaxEngine.STD_DEDUCTION_OLD_REGIME
        );

        RegimeTaxSummaryDto result = IncomeTaxEngine.calculateNewRegime(input);

        assertThat(result.getNetTaxableIncome()).isEqualByComparingTo(new BigDecimal("1500000.00"));
        assertThat(result.getTaxBeforeRebate()).isEqualByComparingTo(new BigDecimal("140000.00"));
        assertThat(result.getCess()).isEqualByComparingTo(new BigDecimal("5600.00"));
        assertThat(result.getTotalTaxPayable()).isEqualByComparingTo(new BigDecimal("145600.00"));
        assertThat(result.getEffectiveTaxRatePercent()).isEqualByComparingTo(new BigDecimal("9.24"));
    }

    /**
     * Hand-worked Case 3:
     * Gross Salary = ₹15,50,000 under Old Regime
     * Deductions:
     * - Standard Deduction = ₹50,000
     * - Section 80C = ₹1,50,000
     * - Section 80D = ₹25,000
     * - Section 80CCD(1B) = ₹25,000
     * Total Deductions = 50,000 + 1,50,000 + 25,000 + 25,000 = ₹2,50,000
     * Taxable Income = 15,50,000 - 2,50,000 = ₹13,00,000
     * Slabs:
     * - 0 to 2.5L: ₹0
     * - 2.5L to 5L (5% on 2.5L): ₹12,500
     * - 5L to 10L (20% on 5L): ₹1,00,000
     * - Above 10L (30% on 3L): ₹90,000
     * Tax Before Rebate = 12,500 + 1,00,000 + 90,000 = ₹2,02,500
     * Rebate 87A = ₹0
     * Cess (4% of 2,02,500) = ₹8,100
     * Total Tax = ₹2,10,600
     */
    @Test
    @DisplayName("Hand-verified: Old Regime with ₹2.5L total deductions results in ₹2,10,600 tax")
    void testOldRegimeWithDeductions() {
        IncomeTaxEngine.TaxComputationInput input = new IncomeTaxEngine.TaxComputationInput(
                new BigDecimal("1550000.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                new BigDecimal("150000.00"), // 80C
                new BigDecimal("25000.00"),  // 80D
                new BigDecimal("25000.00"),  // 80CCD(1B)
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "NORMAL_BELOW_60",
                null,
                null,
                IncomeTaxEngine.STD_DEDUCTION_NEW_REGIME,
                IncomeTaxEngine.STD_DEDUCTION_OLD_REGIME
        );

        RegimeTaxSummaryDto result = IncomeTaxEngine.calculateOldRegime(input);

        assertThat(result.getTotalDeductions()).isEqualByComparingTo(new BigDecimal("250000.00"));
        assertThat(result.getNetTaxableIncome()).isEqualByComparingTo(new BigDecimal("1300000.00"));
        assertThat(result.getTaxBeforeRebate()).isEqualByComparingTo(new BigDecimal("202500.00"));
        assertThat(result.getCess()).isEqualByComparingTo(new BigDecimal("8100.00"));
        assertThat(result.getTotalTaxPayable()).isEqualByComparingTo(new BigDecimal("210600.00"));
    }

    @Test
    @DisplayName("Senior Citizen (>60) gets ₹3,00,000 basic exemption under Old Regime")
    void testSeniorCitizenOldRegimeBasicExemption() {
        IncomeTaxEngine.TaxComputationInput input = new IncomeTaxEngine.TaxComputationInput(
                new BigDecimal("500000.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "SENIOR_60_TO_80",
                null,
                null,
                IncomeTaxEngine.STD_DEDUCTION_NEW_REGIME,
                IncomeTaxEngine.STD_DEDUCTION_OLD_REGIME
        );

        RegimeTaxSummaryDto result = IncomeTaxEngine.calculateOldRegime(input);

        // Taxable = 5,00,000 - 50,000 = 4,50,000
        // Senior slab: 0 to 3L is 0; 3L to 4.5L @ 5% = 1,50,000 * 5% = ₹7,500
        // 87A rebate covers ₹7,500 since taxable <= 5L
        assertThat(result.getTaxBeforeRebate()).isEqualByComparingTo(new BigDecimal("7500.00"));
        assertThat(result.getRebate87A()).isEqualByComparingTo(new BigDecimal("7500.00"));
        assertThat(result.getTotalTaxPayable()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
