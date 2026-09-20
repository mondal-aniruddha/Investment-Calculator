package com.infinance.config_engine.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.infinance.config_engine.dto.AssumptionUpsertRequest;
import com.infinance.config_engine.dto.TaxSlabUpsertRequest;
import com.infinance.config_engine.entity.AssumptionAuditEntity;
import com.infinance.config_engine.entity.FinancialAssumptionEntity;
import com.infinance.config_engine.repository.AssumptionAuditRepository;
import com.infinance.config_engine.repository.FinancialAssumptionRepository;
import com.infinance.tax.entity.TaxSlabEntity;
import com.infinance.tax.repository.TaxSlabRepository;
import jakarta.transaction.Transactional;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AdminAssumptionService {
    private final FinancialAssumptionRepository assumptions;
    private final TaxSlabRepository slabs;
    private final AssumptionAuditRepository audit;
    private final JsonMapper mapper = JsonMapper.builder().findAndAddModules().build();
    private final CacheManager cacheManager;

    public AdminAssumptionService(FinancialAssumptionRepository assumptions, TaxSlabRepository slabs,
                                  AssumptionAuditRepository audit, CacheManager cacheManager) {
        this.assumptions = assumptions;
        this.slabs = slabs;
        this.audit = audit;
        this.cacheManager = cacheManager;
    }

    @Transactional
    public FinancialAssumptionEntity upsertAssumption(String id, AssumptionUpsertRequest request, String actor) {
        FinancialAssumptionEntity entity = assumptions.findById(id).orElseGet(FinancialAssumptionEntity::new);
        entity.setId(id == null || id.isBlank() ? UUID.randomUUID().toString() : id);
        entity.setCategory(request.category()); entity.setSubKey(request.subKey());
        entity.setNumericalValue(request.numericalValue()); entity.setTextValue(request.textValue());
        entity.setFinancialYear(request.financialYear()); entity.setDescription(request.description());
        entity.setIsActive(request.active() == null || request.active()); entity.setUpdatedAt(Instant.now());
        FinancialAssumptionEntity saved = assumptions.save(entity);
        record("ASSUMPTION", saved.getId(), "UPSERT", actor, saved);
        evict();
        return saved;
    }

    @Transactional
    public void deleteAssumption(String id, String actor) {
        assumptions.deleteById(id);
        record("ASSUMPTION", id, "DELETE", actor, id);
        evict();
    }

    public List<FinancialAssumptionEntity> listAssumptions(String fy) {
        return fy == null || fy.isBlank() ? assumptions.findAll() : assumptions.findByFinancialYearAndIsActiveTrue(fy);
    }

    @Transactional
    public TaxSlabEntity upsertSlab(Long id, TaxSlabUpsertRequest request, String actor) {
        TaxSlabEntity entity = id == null ? new TaxSlabEntity() : slabs.findById(id).orElseGet(TaxSlabEntity::new);
        entity.setFinancialYear(request.financialYear()); entity.setRegime(request.regime());
        entity.setSlabOrder(request.slabOrder()); entity.setIncomeFrom(request.incomeFrom());
        entity.setIncomeTo(request.incomeTo()); entity.setTaxRatePercent(request.taxRatePercent());
        TaxSlabEntity saved = slabs.save(entity);
        record("TAX_SLAB", String.valueOf(saved.getId()), "UPSERT", actor, saved);
        evict();
        return saved;
    }

    @Transactional
    public void deleteSlab(Long id, String actor) {
        slabs.deleteById(id);
        record("TAX_SLAB", String.valueOf(id), "DELETE", actor, id);
        evict();
    }

    public List<TaxSlabEntity> listSlabs(String fy) {
        return fy == null || fy.isBlank() ? slabs.findAll() : slabs.findByFinancialYearOrderByRegimeAscSlabOrderAsc(fy);
    }

    private void record(String type, String id, String action, String actor, Object payload) {
        try {
            audit.save(new AssumptionAuditEntity(type, id, action, actor, mapper.writeValueAsString(payload)));
        } catch (JsonProcessingException e) {
            audit.save(new AssumptionAuditEntity(type, id, action, actor, String.valueOf(payload)));
        }
    }

    private void evict() {
        if (cacheManager != null) cacheManager.getCacheNames().forEach(name -> cacheManager.getCache(name).clear());
    }
}
