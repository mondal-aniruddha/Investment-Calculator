package com.infinance.config_engine.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "financial_assumptions")
public class FinancialAssumptionEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 32)
    private String category;

    @Column(nullable = false, length = 64)
    private String subKey;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal numericalValue;

    @Column(length = 255)
    private String textValue;

    @Column(nullable = false, length = 16)
    private String financialYear;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column
    private Instant updatedAt = Instant.now();

    public FinancialAssumptionEntity() {
    }

    public FinancialAssumptionEntity(String id, String category, String subKey, BigDecimal numericalValue,
                                     String textValue, String financialYear, String description,
                                     Boolean isActive, Instant updatedAt) {
        this.id = id;
        this.category = category;
        this.subKey = subKey;
        this.numericalValue = numericalValue;
        this.textValue = textValue;
        this.financialYear = financialYear;
        this.description = description;
        this.isActive = isActive != null ? isActive : true;
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubKey() { return subKey; }
    public void setSubKey(String subKey) { this.subKey = subKey; }

    public BigDecimal getNumericalValue() { return numericalValue; }
    public void setNumericalValue(BigDecimal numericalValue) { this.numericalValue = numericalValue; }

    public String getTextValue() { return textValue; }
    public void setTextValue(String textValue) { this.textValue = textValue; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
