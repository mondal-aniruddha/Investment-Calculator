package com.infinance.taxoptimizer.dto;
import com.infinance.common.dto.BaseAssumptionsDto;
import java.math.BigDecimal;
public record TaxOptimizerResponse(BigDecimal recommended80C, BigDecimal recommended80D,
        BigDecimal recommendedNps, BigDecimal estimatedAdditionalOldRegimeTaxSaved,
        BigDecimal oldRegimeTax, BigDecimal newRegimeTax, String recommendedRegime,
        BaseAssumptionsDto assumptions) {}
