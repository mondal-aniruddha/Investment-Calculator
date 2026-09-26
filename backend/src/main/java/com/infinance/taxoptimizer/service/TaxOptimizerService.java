package com.infinance.taxoptimizer.service;
import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.common.config.FinancialProperties;
import com.infinance.config_engine.service.AssumptionService;
import com.infinance.tax.dto.TaxCalculationRequestDto;
import com.infinance.tax.service.TaxService;
import com.infinance.taxoptimizer.dto.*;
import com.infinance.taxoptimizer.engine.TaxOptimizerEngine;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.Map;
@Service public class TaxOptimizerService {
    private final TaxService taxService; private final AssumptionService assumptions;
    public TaxOptimizerService(TaxService taxService, AssumptionService assumptions) { this.taxService = taxService; this.assumptions = assumptions; }
    public TaxOptimizerResponse calculate(TaxOptimizerRequest r) {
        var old = new TaxCalculationRequestDto(); old.setGrossSalary(r.grossSalary()); old.setSection80C(r.section80C());
        old.setSection80DMedicalInsurance(r.section80DMedicalInsurance()); old.setSection80CCD1BNps(r.section80CCD1BNps());
        old.setFinancialYear(r.financialYear());
        var current = taxService.calculateTax(old);
        String fy = r.financialYear() == null ? assumptions.getProperties().getCurrentFinancialYear() : r.financialYear();
        FinancialProperties.TaxYearConfig taxYear = assumptions.getProperties().getTax().get(fy);
        if (taxYear == null) {
            taxYear = assumptions.getProperties().getTax().get("fy-" + fy);
        }
        FinancialProperties.RegimeConfig oldConfig = taxYear == null ? new FinancialProperties.RegimeConfig() : taxYear.getOldRegime();
        BigDecimal limit80c = oldConfig.getSection80cLimit();
        BigDecimal limit80d = oldConfig.getSection80dSelfFamilyLimit();
        BigDecimal limitNps = oldConfig.getSection80ccd1bLimit();
        var max = new TaxCalculationRequestDto(); max.setGrossSalary(r.grossSalary()); max.setSection80C(limit80c);
        max.setSection80DMedicalInsurance(limit80d); max.setSection80CCD1BNps(limitNps); max.setFinancialYear(fy);
        var optimised = taxService.calculateTax(max);
        BigDecimal saved = current.getOldRegime().getTotalTaxPayable().subtract(optimised.getOldRegime().getTotalTaxPayable()).max(BigDecimal.ZERO);
        BaseAssumptionsDto a = assumptions.buildBaseAssumptions(fy, Map.of("tool", "TAX_SAVING_OPTIMIZER", "limits", Map.of("80C", limit80c, "80D", limit80d, "NPS", limitNps)));
        String regime = optimised.getRecommendedRegime();
        return new TaxOptimizerResponse(TaxOptimizerEngine.remaining(r.section80C(), limit80c),
                TaxOptimizerEngine.remaining(r.section80DMedicalInsurance(), limit80d),
                TaxOptimizerEngine.remaining(r.section80CCD1BNps(), limitNps), saved,
                optimised.getOldRegime().getTotalTaxPayable(), optimised.getNewRegime().getTotalTaxPayable(), regime, a);
    }
}
