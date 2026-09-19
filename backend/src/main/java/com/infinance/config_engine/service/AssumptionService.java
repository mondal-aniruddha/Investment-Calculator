package com.infinance.config_engine.service;

import com.infinance.common.config.FinancialProperties;
import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.config_engine.entity.FinancialAssumptionEntity;
import com.infinance.config_engine.repository.FinancialAssumptionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AssumptionService {

    private final FinancialProperties properties;
    private final FinancialAssumptionRepository assumptionRepository;

    public AssumptionService(FinancialProperties properties, FinancialAssumptionRepository assumptionRepository) {
        this.properties = properties;
        this.assumptionRepository = assumptionRepository;
    }

    /**
     * Retrieves all baseline financial assumptions for the active financial year.
     */
    public Map<String, Object> getAllAssumptions(String financialYear) {
        String effectiveFy = (financialYear != null && !financialYear.isBlank())
                ? financialYear
                : properties.getCurrentFinancialYear();

        Map<String, Object> result = new HashMap<>();
        result.put("financialYear", effectiveFy);
        result.put("disclaimer", properties.getDisclaimer());
        result.put("rates", properties.getRates());

        // Include any DB-overridden or augmented assumptions
        List<FinancialAssumptionEntity> dbAssumptions = assumptionRepository.findByFinancialYearAndIsActiveTrue(effectiveFy);
        Map<String, BigDecimal> dbValues = new HashMap<>();
        for (FinancialAssumptionEntity entity : dbAssumptions) {
            dbValues.put(entity.getSubKey(), entity.getNumericalValue());
        }
        result.put("databaseAssumptions", dbValues);

        return result;
    }

    /**
     * Builds a standard BaseAssumptionsDto for response payloads.
     */
    public BaseAssumptionsDto buildBaseAssumptions(String financialYear, Map<String, Object> moduleExtras) {
        String effectiveFy = (financialYear != null && !financialYear.isBlank())
                ? financialYear
                : properties.getCurrentFinancialYear();

        BigDecimal inflation = properties.getRates().getInflation().getCpiGeneralRate();
        BigDecimal equityReturn = properties.getRates().getMarketBenchmarks().getEquityNiftyCagr();
        BigDecimal debtReturn = properties.getRates().getMarketBenchmarks().getDebtHybridCagr();

        return new BaseAssumptionsDto(
                effectiveFy,
                inflation,
                equityReturn,
                debtReturn,
                properties.getDisclaimer(),
                moduleExtras != null ? moduleExtras : Map.of()
        );
    }

    public FinancialProperties getProperties() {
        return properties;
    }
}
