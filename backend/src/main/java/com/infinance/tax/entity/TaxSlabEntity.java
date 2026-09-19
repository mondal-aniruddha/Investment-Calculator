package com.infinance.tax.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "tax_slabs")
public class TaxSlabEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 16)
    private String financialYear;

    @Column(nullable = false, length = 16)
    private String regime; // 'OLD' or 'NEW'

    @Column(nullable = false)
    private Integer slabOrder;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal incomeFrom;

    @Column(precision = 15, scale = 2)
    private BigDecimal incomeTo; // null for no upper limit

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRatePercent;

    @Column
    private Instant createdAt = Instant.now();

    public TaxSlabEntity() {
    }

    public TaxSlabEntity(Long id, String financialYear, String regime, Integer slabOrder,
                         BigDecimal incomeFrom, BigDecimal incomeTo, BigDecimal taxRatePercent,
                         Instant createdAt) {
        this.id = id;
        this.financialYear = financialYear;
        this.regime = regime;
        this.slabOrder = slabOrder;
        this.incomeFrom = incomeFrom;
        this.incomeTo = incomeTo;
        this.taxRatePercent = taxRatePercent;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public String getRegime() { return regime; }
    public void setRegime(String regime) { this.regime = regime; }

    public Integer getSlabOrder() { return slabOrder; }
    public void setSlabOrder(Integer slabOrder) { this.slabOrder = slabOrder; }

    public BigDecimal getIncomeFrom() { return incomeFrom; }
    public void setIncomeFrom(BigDecimal incomeFrom) { this.incomeFrom = incomeFrom; }

    public BigDecimal getIncomeTo() { return incomeTo; }
    public void setIncomeTo(BigDecimal incomeTo) { this.incomeTo = incomeTo; }

    public BigDecimal getTaxRatePercent() { return taxRatePercent; }
    public void setTaxRatePercent(BigDecimal taxRatePercent) { this.taxRatePercent = taxRatePercent; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
