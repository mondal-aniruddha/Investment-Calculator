package com.infinance.tax.engine;

import com.infinance.common.dto.MoneyAmount;
import com.infinance.tax.dto.RegimeTaxSummaryDto;
import com.infinance.tax.dto.SlabBreakdownItemDto;
import com.infinance.tax.dto.TaxSlabDto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure, stateless calculation engine for Indian Income Tax under Old and New Regimes.
 *
 * <p>Key Rules & Mathematical Formulas:</p>
 * <ul>
 *   <li><b>Gross Total Income (GTI):</b> Salary + House Property + Other Sources</li>
 *   <li><b>Taxable Income:</b> max(0, GTI - Standard Deduction - Eligible Deductions)</li>
 *   <li><b>Marginal Tax:</b> Evaluated bracket-by-bracket across progressive slabs</li>
 *   <li><b>Section 87A Rebate:</b>
 *     <ul>
 *       <li>New Regime: 100% tax rebate up to ₹25,000 if taxable income &le; ₹7,00,000.
 *           Marginal relief applies if income marginally exceeds ₹7 Lakhs.</li>
 *       <li>Old Regime: 100% tax rebate up to ₹12,500 if taxable income &le; ₹5,00,000.</li>
 *     </ul>
 *   </li>
 *   <li><b>Health & Education Cess:</b> 4% applied to (Tax after rebate + Surcharge).</li>
 * </ul>
 */
public final class IncomeTaxEngine {

    private static final BigDecimal CESS_RATE = new BigDecimal("0.04");
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    // Caps under Indian Income Tax Act (Old Regime)
    public static final BigDecimal CAP_SECTION_80C = new BigDecimal("150000.00");
    public static final BigDecimal CAP_SECTION_80CCD_1B = new BigDecimal("50000.00");
    public static final BigDecimal CAP_SECTION_24B_SELF_OCCUPIED = new BigDecimal("200000.00");

    // Standard Deductions for FY 2024-2025
    public static final BigDecimal STD_DEDUCTION_NEW_REGIME = new BigDecimal("75000.00");
    public static final BigDecimal STD_DEDUCTION_OLD_REGIME = new BigDecimal("50000.00");

    // Section 87A Thresholds
    public static final BigDecimal REBATE_87A_LIMIT_NEW = new BigDecimal("700000.00");
    public static final BigDecimal REBATE_87A_MAX_NEW = new BigDecimal("25000.00");
    public static final BigDecimal REBATE_87A_LIMIT_OLD = new BigDecimal("500000.00");
    public static final BigDecimal REBATE_87A_MAX_OLD = new BigDecimal("12500.00");

    private IncomeTaxEngine() {
    }

    public record TaxComputationInput(
            BigDecimal grossSalary,
            BigDecimal incomeOtherSources,
            BigDecimal incomeHouseProperty,
            BigDecimal section80C,
            BigDecimal section80D,
            BigDecimal section80CCD1B,
            BigDecimal hraExemption,
            BigDecimal homeLoanInterest24b,
            BigDecimal otherDeductions,
            String ageCategory,
            List<TaxSlabDto> customNewSlabs,
            List<TaxSlabDto> customOldSlabs,
            BigDecimal customNewStdDeduction,
            BigDecimal customOldStdDeduction
    ) {}

    /**
     * Calculates tax under New Regime (Section 115BAC).
     */
    public static RegimeTaxSummaryDto calculateNewRegime(TaxComputationInput input) {
        BigDecimal grossTotalIncome = input.grossSalary()
                .add(input.incomeOtherSources())
                .add(input.incomeHouseProperty());

        BigDecimal stdDeduction = (input.customNewStdDeduction() != null)
                ? input.customNewStdDeduction()
                : STD_DEDUCTION_NEW_REGIME;

        // Standard deduction applies only up to gross salary
        BigDecimal effectiveStdDeduction = input.grossSalary().min(stdDeduction);

        // Under New Regime, Chapter VI-A deductions are not allowable for individuals
        BigDecimal totalDeductions = effectiveStdDeduction;
        BigDecimal taxableIncome = grossTotalIncome.subtract(totalDeductions).max(BigDecimal.ZERO);

        List<TaxSlabDto> slabs = (input.customNewSlabs() != null && !input.customNewSlabs().isEmpty())
                ? input.customNewSlabs()
                : getDefaultNewRegimeSlabs();

        SlabCalculationResult slabResult = calculateSlabTax(taxableIncome, slabs);

        // Section 87A Rebate & Marginal Relief
        BigDecimal taxBeforeRebate = slabResult.totalTax();
        BigDecimal rebate87A = BigDecimal.ZERO;
        BigDecimal taxAfterRebate = taxBeforeRebate;

        if (taxableIncome.compareTo(REBATE_87A_LIMIT_NEW) <= 0) {
            rebate87A = taxBeforeRebate.min(REBATE_87A_MAX_NEW);
            taxAfterRebate = taxBeforeRebate.subtract(rebate87A).max(BigDecimal.ZERO);
        } else {
            // Check marginal relief for New Regime:
            // Tax payable cannot exceed (Taxable Income - ₹7,00,000)
            BigDecimal excessIncome = taxableIncome.subtract(REBATE_87A_LIMIT_NEW);
            if (taxBeforeRebate.compareTo(excessIncome) > 0) {
                BigDecimal relief = taxBeforeRebate.subtract(excessIncome);
                taxAfterRebate = excessIncome;
                rebate87A = relief;
            }
        }

        BigDecimal surcharge = calculateSurcharge(taxableIncome, taxAfterRebate, true);
        BigDecimal cess = taxAfterRebate.add(surcharge).multiply(CESS_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalTax = taxAfterRebate.add(surcharge).add(cess).setScale(2, RoundingMode.HALF_UP);

        BigDecimal effectiveRate = (grossTotalIncome.compareTo(BigDecimal.ZERO) > 0)
                ? totalTax.divide(grossTotalIncome, 4, RoundingMode.HALF_UP).multiply(HUNDRED).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        return RegimeTaxSummaryDto.builder()
                .regimeName("NEW")
                .grossTotalIncome(grossTotalIncome)
                .standardDeduction(effectiveStdDeduction)
                .totalDeductions(totalDeductions)
                .netTaxableIncome(taxableIncome)
                .slabBreakdown(slabResult.items())
                .taxBeforeRebate(taxBeforeRebate)
                .rebate87A(rebate87A)
                .taxAfterRebate(taxAfterRebate)
                .surcharge(surcharge)
                .cess(cess)
                .totalTaxPayable(totalTax)
                .effectiveTaxRatePercent(effectiveRate)
                .grossIncomeFormatted(MoneyAmount.of(grossTotalIncome))
                .standardDeductionFormatted(MoneyAmount.of(effectiveStdDeduction))
                .totalDeductionsFormatted(MoneyAmount.of(totalDeductions))
                .netTaxableIncomeFormatted(MoneyAmount.of(taxableIncome))
                .taxBeforeRebateFormatted(MoneyAmount.of(taxBeforeRebate))
                .rebate87AFormatted(MoneyAmount.of(rebate87A))
                .cessFormatted(MoneyAmount.of(cess))
                .totalTaxPayableFormatted(MoneyAmount.of(totalTax))
                .build();
    }

    /**
     * Calculates tax under Old Regime with Chapter VI-A deductions and Section 24(b).
     */
    public static RegimeTaxSummaryDto calculateOldRegime(TaxComputationInput input) {
        BigDecimal grossTotalIncome = input.grossSalary()
                .add(input.incomeOtherSources())
                .add(input.incomeHouseProperty());

        BigDecimal stdDeduction = (input.customOldStdDeduction() != null)
                ? input.customOldStdDeduction()
                : STD_DEDUCTION_OLD_REGIME;

        BigDecimal effectiveStdDeduction = input.grossSalary().min(stdDeduction);

        // Cap applicable deductions
        BigDecimal eligible80C = input.section80C().min(CAP_SECTION_80C);
        BigDecimal eligible80CCD = input.section80CCD1B().min(CAP_SECTION_80CCD_1B);
        BigDecimal eligible24b = input.homeLoanInterest24b().min(CAP_SECTION_24B_SELF_OCCUPIED);
        BigDecimal eligible80D = input.section80D(); // Health insurance
        BigDecimal eligibleHra = input.hraExemption();
        BigDecimal otherDeductions = input.otherDeductions();

        BigDecimal itemizedDeductions = eligible80C
                .add(eligible80CCD)
                .add(eligible24b)
                .add(eligible80D)
                .add(eligibleHra)
                .add(otherDeductions);

        BigDecimal totalDeductions = effectiveStdDeduction.add(itemizedDeductions);
        BigDecimal taxableIncome = grossTotalIncome.subtract(totalDeductions).max(BigDecimal.ZERO);

        List<TaxSlabDto> slabs = (input.customOldSlabs() != null && !input.customOldSlabs().isEmpty())
                ? input.customOldSlabs()
                : getDefaultOldRegimeSlabs(input.ageCategory());

        SlabCalculationResult slabResult = calculateSlabTax(taxableIncome, slabs);

        BigDecimal taxBeforeRebate = slabResult.totalTax();
        BigDecimal rebate87A = BigDecimal.ZERO;
        BigDecimal taxAfterRebate = taxBeforeRebate;

        if (taxableIncome.compareTo(REBATE_87A_LIMIT_OLD) <= 0) {
            rebate87A = taxBeforeRebate.min(REBATE_87A_MAX_OLD);
            taxAfterRebate = taxBeforeRebate.subtract(rebate87A).max(BigDecimal.ZERO);
        }

        BigDecimal surcharge = calculateSurcharge(taxableIncome, taxAfterRebate, false);
        BigDecimal cess = taxAfterRebate.add(surcharge).multiply(CESS_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalTax = taxAfterRebate.add(surcharge).add(cess).setScale(2, RoundingMode.HALF_UP);

        BigDecimal effectiveRate = (grossTotalIncome.compareTo(BigDecimal.ZERO) > 0)
                ? totalTax.divide(grossTotalIncome, 4, RoundingMode.HALF_UP).multiply(HUNDRED).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        return RegimeTaxSummaryDto.builder()
                .regimeName("OLD")
                .grossTotalIncome(grossTotalIncome)
                .standardDeduction(effectiveStdDeduction)
                .totalDeductions(totalDeductions)
                .netTaxableIncome(taxableIncome)
                .slabBreakdown(slabResult.items())
                .taxBeforeRebate(taxBeforeRebate)
                .rebate87A(rebate87A)
                .taxAfterRebate(taxAfterRebate)
                .surcharge(surcharge)
                .cess(cess)
                .totalTaxPayable(totalTax)
                .effectiveTaxRatePercent(effectiveRate)
                .grossIncomeFormatted(MoneyAmount.of(grossTotalIncome))
                .standardDeductionFormatted(MoneyAmount.of(effectiveStdDeduction))
                .totalDeductionsFormatted(MoneyAmount.of(totalDeductions))
                .netTaxableIncomeFormatted(MoneyAmount.of(taxableIncome))
                .taxBeforeRebateFormatted(MoneyAmount.of(taxBeforeRebate))
                .rebate87AFormatted(MoneyAmount.of(rebate87A))
                .cessFormatted(MoneyAmount.of(cess))
                .totalTaxPayableFormatted(MoneyAmount.of(totalTax))
                .build();
    }

    private record SlabCalculationResult(BigDecimal totalTax, List<SlabBreakdownItemDto> items) {}

    private static SlabCalculationResult calculateSlabTax(BigDecimal taxableIncome, List<TaxSlabDto> slabs) {
        BigDecimal totalTax = BigDecimal.ZERO;
        List<SlabBreakdownItemDto> breakdown = new ArrayList<>();

        for (TaxSlabDto slab : slabs) {
            BigDecimal min = slab.min();
            BigDecimal max = slab.max();
            BigDecimal rate = slab.ratePercent();

            if (taxableIncome.compareTo(min) <= 0) {
                // Taxable income doesn't reach this slab
                breakdown.add(new SlabBreakdownItemDto(
                        slab.displayRange(),
                        rate,
                        BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                        BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                        MoneyAmount.of(BigDecimal.ZERO),
                        MoneyAmount.of(BigDecimal.ZERO)
                ));
                continue;
            }

            BigDecimal taxableInThisSlab;
            if (max == null) {
                // Unlimited upper slab
                taxableInThisSlab = taxableIncome.subtract(min);
            } else {
                taxableInThisSlab = taxableIncome.min(max).subtract(min);
            }

            BigDecimal taxForSlab = taxableInThisSlab.multiply(rate)
                    .divide(HUNDRED, 2, RoundingMode.HALF_UP);

            totalTax = totalTax.add(taxForSlab);

            breakdown.add(new SlabBreakdownItemDto(
                    slab.displayRange(),
                    rate,
                    taxableInThisSlab.setScale(2, RoundingMode.HALF_UP),
                    taxForSlab.setScale(2, RoundingMode.HALF_UP),
                    MoneyAmount.of(taxableInThisSlab),
                    MoneyAmount.of(taxForSlab)
            ));
        }

        return new SlabCalculationResult(totalTax.setScale(2, RoundingMode.HALF_UP), breakdown);
    }

    private static BigDecimal calculateSurcharge(BigDecimal taxableIncome, BigDecimal baseTax, boolean isNewRegime) {
        BigDecimal fiftyLakhs = new BigDecimal("5000000.00");
        BigDecimal oneCrore = new BigDecimal("10000000.00");
        BigDecimal twoCrores = new BigDecimal("20000000.00");

        if (taxableIncome.compareTo(twoCrores) > 0) {
            // 25% surcharge for both (new regime caps at 25%, old can go to 37% above 5 Cr, simplified to 25%)
            return baseTax.multiply(new BigDecimal("0.25")).setScale(2, RoundingMode.HALF_UP);
        } else if (taxableIncome.compareTo(oneCrore) > 0) {
            return baseTax.multiply(new BigDecimal("0.15")).setScale(2, RoundingMode.HALF_UP);
        } else if (taxableIncome.compareTo(fiftyLakhs) > 0) {
            return baseTax.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    public static List<TaxSlabDto> getDefaultNewRegimeSlabs() {
        return List.of(
                new TaxSlabDto(1, new BigDecimal("0.00"), new BigDecimal("300000.00"), BigDecimal.ZERO, "₹0 - ₹3 Lakh"),
                new TaxSlabDto(2, new BigDecimal("300000.00"), new BigDecimal("700000.00"), new BigDecimal("5.00"), "₹3 Lakh - ₹7 Lakh"),
                new TaxSlabDto(3, new BigDecimal("700000.00"), new BigDecimal("1000000.00"), new BigDecimal("10.00"), "₹7 Lakh - ₹10 Lakh"),
                new TaxSlabDto(4, new BigDecimal("1000000.00"), new BigDecimal("1200000.00"), new BigDecimal("15.00"), "₹10 Lakh - ₹12 Lakh"),
                new TaxSlabDto(5, new BigDecimal("1200000.00"), new BigDecimal("1500000.00"), new BigDecimal("20.00"), "₹12 Lakh - ₹15 Lakh"),
                new TaxSlabDto(6, new BigDecimal("1500000.00"), null, new BigDecimal("30.00"), "Above ₹15 Lakh")
        );
    }

    public static List<TaxSlabDto> getDefaultOldRegimeSlabs(String ageCategory) {
        String age = (ageCategory == null) ? "NORMAL_BELOW_60" : ageCategory.toUpperCase();
        BigDecimal exemptionLimit = switch (age) {
            case "SUPER_SENIOR_ABOVE_80" -> new BigDecimal("500000.00");
            case "SENIOR_60_TO_80" -> new BigDecimal("300000.00");
            default -> new BigDecimal("250000.00");
        };

        List<TaxSlabDto> list = new ArrayList<>();
        list.add(new TaxSlabDto(1, BigDecimal.ZERO, exemptionLimit, BigDecimal.ZERO, "₹0 - ₹" + exemptionLimit.divide(new BigDecimal("100000")).toPlainString() + " Lakh"));

        if (exemptionLimit.compareTo(new BigDecimal("500000.00")) < 0) {
            list.add(new TaxSlabDto(2, exemptionLimit, new BigDecimal("500000.00"), new BigDecimal("5.00"),
                    "₹" + exemptionLimit.divide(new BigDecimal("100000")).toPlainString() + " Lakh - ₹5 Lakh"));
        }

        list.add(new TaxSlabDto(3, new BigDecimal("500000.00"), new BigDecimal("1000000.00"), new BigDecimal("20.00"), "₹5 Lakh - ₹10 Lakh"));
        list.add(new TaxSlabDto(4, new BigDecimal("1000000.00"), null, new BigDecimal("30.00"), "Above ₹10 Lakh"));

        return list;
    }

    public static List<String> getTaxTips() {
        return List.of(
                "Marginal vs Flat: Indian tax rates apply only to income within that particular slab, not on your entire income.",
                "New Regime Zero-Tax Rule: Under Section 87A (FY 2024-25), if your taxable income under New Regime is up to ₹7,00,000, you receive a full tax rebate of up to ₹25,000, making your tax ZERO.",
                "Standard Deduction: Salaried taxpayers get an automatic ₹75,000 standard deduction under New Regime (FY 24-25) and ₹50,000 under Old Regime without needing receipts.",
                "Breakeven Point: If your total deductions (80C + 80D + 24b + HRA) exceed ₹3.75 - ₹4.0 Lakhs, the Old Regime may yield higher savings; otherwise, the New Regime with lower slab rates is typically more beneficial.",
                "Health & Education Cess: A 4% mandatory cess is levied on the total tax calculated after rebate and surcharge."
        );
    }
}
