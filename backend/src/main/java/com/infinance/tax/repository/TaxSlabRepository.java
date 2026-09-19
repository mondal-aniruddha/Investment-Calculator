package com.infinance.tax.repository;

import com.infinance.tax.entity.TaxSlabEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaxSlabRepository extends JpaRepository<TaxSlabEntity, Long> {

    List<TaxSlabEntity> findByFinancialYearOrderByRegimeAscSlabOrderAsc(String financialYear);

    List<TaxSlabEntity> findByFinancialYearAndRegimeOrderBySlabOrderAsc(String financialYear, String regime);
}
