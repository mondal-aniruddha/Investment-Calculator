package com.infinance.queries.repository;

import com.infinance.queries.entity.FinanceQuery;
import com.infinance.queries.entity.QueryCategory;
import com.infinance.queries.entity.QueryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FinanceQueryRepository extends JpaRepository<FinanceQuery, String>, JpaSpecificationExecutor<FinanceQuery> {
    Optional<FinanceQuery> findByReferenceId(String referenceId);

    Page<FinanceQuery> findByStatus(QueryStatus status, Pageable pageable);

    Page<FinanceQuery> findByCategory(QueryCategory category, Pageable pageable);

    Page<FinanceQuery> findByStatusAndCategory(QueryStatus status, QueryCategory category, Pageable pageable);
}
