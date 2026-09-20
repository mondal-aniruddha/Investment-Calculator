package com.infinance.tax.repository;

import com.infinance.tax.entity.TaxSlabEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaxSlabRepository extends JpaRepository<TaxSlabEntity, Long> {

    List<TaxSlabEntity> findByFinancialYearOrderByRegimeAscSlabOrderAsc(String financialYear);

    List<TaxSlabEntity> findByFinancialYearAndRegimeOrderBySlabOrderAsc(String financialYear, String regime);
}
