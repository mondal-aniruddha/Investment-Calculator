package com.infinance.common.dto;

import com.infinance.common.money.IndianCurrencyFormatter;

import java.math.BigDecimal;

/**
 * Encapsulates a monetary figure alongside its standard Indian Rupee representation
 * and Indian shorthand (Lakhs/Crores).
 */
public record MoneyAmount(
        BigDecimal amount,
        String formattedInr,
        String shorthandInr
) {
    public static MoneyAmount of(BigDecimal amount) {
        if (amount == null) {
            return new MoneyAmount(BigDecimal.ZERO, "₹0", "₹0");
        }
        return new MoneyAmount(
                amount,
                IndianCurrencyFormatter.formatINR(amount, false),
                IndianCurrencyFormatter.formatShorthand(amount)
        );
    }

    public static MoneyAmount ofWithDecimals(BigDecimal amount) {
        if (amount == null) {
            return new MoneyAmount(BigDecimal.ZERO, "₹0.00", "₹0");
        }
        return new MoneyAmount(
                amount,
                IndianCurrencyFormatter.formatINR(amount, true),
                IndianCurrencyFormatter.formatShorthand(amount)
        );
    }
}
