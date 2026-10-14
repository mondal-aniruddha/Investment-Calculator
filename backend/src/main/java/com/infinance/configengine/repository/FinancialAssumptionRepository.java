package com.infinance.configengine.repository;

import com.infinance.configengine.entity.FinancialAssumptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FinancialAssumptionRepository extends JpaRepository<FinancialAssumptionEntity, String> {

    List<FinancialAssumptionEntity> findByFinancialYearAndIsActiveTrue(String financialYear);

    Optional<FinancialAssumptionEntity> findBySubKeyAndFinancialYear(String subKey, String financialYear);

    List<FinancialAssumptionEntity> findByCategoryAndFinancialYear(String category, String financialYear);
}
