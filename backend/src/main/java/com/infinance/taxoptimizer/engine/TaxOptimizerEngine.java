package com.infinance.taxoptimizer.engine;
import java.math.*;
/** Pure deduction-cap recommendation; the tax service supplies configured regime calculations. */
public final class TaxOptimizerEngine {
    private TaxOptimizerEngine() {}
    public static BigDecimal remaining(BigDecimal current, BigDecimal cap) {
        return cap.subtract(current == null ? BigDecimal.ZERO : current).max(BigDecimal.ZERO);
    }
}
