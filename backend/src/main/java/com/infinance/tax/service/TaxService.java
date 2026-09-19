package com.infinance.tax.service;

import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.common.dto.MoneyAmount;
import com.infinance.config_engine.service.AssumptionService;
import com.infinance.tax.dto.RegimeTaxSummaryDto;
import com.infinance.tax.dto.TaxCalculationRequestDto;
import com.infinance.tax.dto.TaxCalculationResponseDto;
import com.infinance.tax.dto.TaxSlabDto;
import com.infinance.tax.engine.IncomeTaxEngine;
import com.infinance.tax.entity.TaxSlabEntity;
import com.infinance.tax.repository.TaxSlabRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TaxService {

    private final TaxSlabRepository slabRepository;
    private final AssumptionService assumptionService;

    public TaxService(TaxSlabRepository slabRepository, AssumptionService assumptionService) {
        this.slabRepository = slabRepository;
        this.assumptionService = assumptionService;
    }

    public TaxCalculationResponseDto calculateTax(TaxCalculationRequestDto request) {
        String effectiveFy = (request.getFinancialYear() != null && !request.getFinancialYear().isBlank())
                ? request.getFinancialYear()
                : assumptionService.getProperties().getCurrentFinancialYear();

        List<TaxSlabDto> newSlabs = loadSlabs(effectiveFy, "NEW");
        List<TaxSlabDto> oldSlabs = loadSlabs(effectiveFy, "OLD");

        IncomeTaxEngine.TaxComputationInput input = new IncomeTaxEngine.TaxComputationInput(
                request.getGrossSalary(),
                request.getIncomeFromOtherSources() != null ? request.getIncomeFromOtherSources() : BigDecimal.ZERO,
                request.getIncomeFromHouseProperty() != null ? request.getIncomeFromHouseProperty() : BigDecimal.ZERO,
                request.getSection80C() != null ? request.getSection80C() : BigDecimal.ZERO,
                request.getSection80DMedicalInsurance() != null ? request.getSection80DMedicalInsurance() : BigDecimal.ZERO,
                request.getSection80CCD1BNps() != null ? request.getSection80CCD1BNps() : BigDecimal.ZERO,
                request.getHraExemption() != null ? request.getHraExemption() : BigDecimal.ZERO,
                request.getHomeLoanInterestSection24b() != null ? request.getHomeLoanInterestSection24b() : BigDecimal.ZERO,
                request.getOtherDeductionsChapterVIA() != null ? request.getOtherDeductionsChapterVIA() : BigDecimal.ZERO,
                request.getAgeCategory(),
                newSlabs,
                oldSlabs,
                IncomeTaxEngine.STD_DEDUCTION_NEW_REGIME,
                IncomeTaxEngine.STD_DEDUCTION_OLD_REGIME
        );

        RegimeTaxSummaryDto newSummary = IncomeTaxEngine.calculateNewRegime(input);
        RegimeTaxSummaryDto oldSummary = IncomeTaxEngine.calculateOldRegime(input);

        String recommended;
        BigDecimal diff;
        String summaryMsg;

        int compare = newSummary.getTotalTaxPayable().compareTo(oldSummary.getTotalTaxPayable());
        if (compare < 0) {
            recommended = "NEW";
            diff = oldSummary.getTotalTaxPayable().subtract(newSummary.getTotalTaxPayable());
            summaryMsg = "The New Tax Regime is more beneficial. You save " +
                    MoneyAmount.of(diff).formattedInr() + " in taxes compared to the Old Regime.";
        } else if (compare > 0) {
            recommended = "OLD";
            diff = newSummary.getTotalTaxPayable().subtract(oldSummary.getTotalTaxPayable());
            summaryMsg = "The Old Tax Regime is more beneficial due to your itemized deductions. You save " +
                    MoneyAmount.of(diff).formattedInr() + " in taxes compared to the New Regime.";
        } else {
            recommended = "EITHER";
            diff = BigDecimal.ZERO;
            summaryMsg = "Both regimes result in the exact same tax liability.";
        }

        Map<String, Object> moduleExtras = new HashMap<>();
        moduleExtras.put("newRegimeStandardDeduction", IncomeTaxEngine.STD_DEDUCTION_NEW_REGIME);
        moduleExtras.put("oldRegimeStandardDeduction", IncomeTaxEngine.STD_DEDUCTION_OLD_REGIME);
        moduleExtras.put("section87aRebateThresholdNew", IncomeTaxEngine.REBATE_87A_LIMIT_NEW);

        BaseAssumptionsDto assumptions = assumptionService.buildBaseAssumptions(effectiveFy, moduleExtras);

        return TaxCalculationResponseDto.builder()
                .financialYear(effectiveFy)
                .assessmentYear("2025-2026")
                .newRegime(newSummary)
                .oldRegime(oldSummary)
                .recommendedRegime(recommended)
                .taxDifference(diff)
                .taxDifferenceFormatted(MoneyAmount.of(diff))
                .summaryMessage(summaryMsg)
                .taxTipsAndExplainer(IncomeTaxEngine.getTaxTips())
                .assumptions(assumptions)
                .build();
    }

    public Map<String, List<TaxSlabDto>> getTaxSlabs(String financialYear) {
        String effectiveFy = (financialYear != null && !financialYear.isBlank())
                ? financialYear
                : assumptionService.getProperties().getCurrentFinancialYear();

        Map<String, List<TaxSlabDto>> result = new HashMap<>();
        result.put("newRegime", loadSlabs(effectiveFy, "NEW"));
        result.put("oldRegime", loadSlabs(effectiveFy, "OLD"));
        return result;
    }

    private List<TaxSlabDto> loadSlabs(String financialYear, String regime) {
        List<TaxSlabEntity> entities = slabRepository.findByFinancialYearAndRegimeOrderBySlabOrderAsc(financialYear, regime);
        if (entities.isEmpty()) {
            return regime.equalsIgnoreCase("NEW")
                    ? IncomeTaxEngine.getDefaultNewRegimeSlabs()
                    : IncomeTaxEngine.getDefaultOldRegimeSlabs("NORMAL_BELOW_60");
        }

        List<TaxSlabDto> list = new ArrayList<>();
        for (TaxSlabEntity e : entities) {
            String display;
            if (e.getIncomeTo() == null) {
                display = "Above ₹" + e.getIncomeFrom().divide(new BigDecimal("100000")).toPlainString() + " Lakh";
            } else {
                display = "₹" + e.getIncomeFrom().divide(new BigDecimal("100000")).toPlainString() + " Lakh - ₹" +
                        e.getIncomeTo().divide(new BigDecimal("100000")).toPlainString() + " Lakh";
            }
            list.add(new TaxSlabDto(e.getSlabOrder(), e.getIncomeFrom(), e.getIncomeTo(), e.getTaxRatePercent(), display));
        }
        return list;
    }
}
