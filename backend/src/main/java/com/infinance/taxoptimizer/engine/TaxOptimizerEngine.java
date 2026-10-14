package com.infinance.taxoptimizer.engine;
import java.math.*;
/**
 * Pure, stateless engine for Indian tax deduction optimization.
 * Calculates remaining available deduction room across various sections of the Indian Income Tax Act
 * (e.g., Section 80C, 80D, 80CCD(1B), 24(b)).
 */
public final class TaxOptimizerEngine {
    private TaxOptimizerEngine() {}

    /**
     * Calculates the remaining deductible amount for a given limit and current contribution.
     *
     * @param current The current utilized deduction amount (e.g., existing 80C investments)
     * @param cap The statutory maximum deduction cap for the section
     * @return The remaining eligible deduction capacity, non-negative
     */
    public static BigDecimal remaining(BigDecimal current, BigDecimal cap) {
        return cap.subtract(current == null ? BigDecimal.ZERO : current).max(BigDecimal.ZERO);
    }
}
