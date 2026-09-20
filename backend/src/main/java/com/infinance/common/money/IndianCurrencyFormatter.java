package com.infinance.common.money;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Utility for formatting currency amounts into the Indian numbering system (Lakhs, Crores).
 * Standard: ₹12,34,567.89
 * Shorthand: ₹12.35 L, ₹1.23 Cr
 */
public final class IndianCurrencyFormatter {

    public static final String RUPEE_SYMBOL = "₹";
    private static final BigDecimal ONE_THOUSAND = new BigDecimal("1000");
    private static final BigDecimal ONE_LAKH = new BigDecimal("100000");
    private static final BigDecimal ONE_CRORE = new BigDecimal("10000000");

    private IndianCurrencyFormatter() {
        // Private constructor for utility class
    }

    /**
     * Formats a BigDecimal to Indian currency string with Rupee symbol and commas.
     * Example: 1234567.89 -> "₹12,34,567.89" or "₹12,34,568" if rounded
     *
     * @param amount The monetary amount
     * @param includeDecimals whether to include 2 decimal places
     * @return Formatted INR string
     */
    public static String formatINR(BigDecimal amount, boolean includeDecimals) {
        if (amount == null) {
            return RUPEE_SYMBOL + "0";
        }

        boolean isNegative = amount.compareTo(BigDecimal.ZERO) < 0;
        BigDecimal absoluteAmount = amount.abs().setScale(includeDecimals ? 2 : 0, RoundingMode.HALF_UP);

        long integerPart = absoluteAmount.toBigInteger().longValue();
        String decimalPart = "";

        if (includeDecimals) {
            BigDecimal remainder = absoluteAmount.remainder(BigDecimal.ONE);
            int cents = remainder.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).intValue();
            decimalPart = String.format(".%02d", cents);
        }

        String formattedInteger = formatIndianGrouping(integerPart);
        String prefix = isNegative ? "-" + RUPEE_SYMBOL : RUPEE_SYMBOL;

        return prefix + formattedInteger + decimalPart;
    }

    /**
     * Overload formatting without decimals by default for round Rupee display.
     */
    public static String formatINR(BigDecimal amount) {
        return formatINR(amount, false);
    }

    /**
     * Formats an amount into human-readable Indian shorthand:
     * - Under 1 Lakh: ₹12,345
     * - 1 Lakh to 99.99 Lakh: ₹12.34 L
     * - 1 Crore and above: ₹1.45 Cr
     *
     * @param amount The monetary amount
     * @return Shorthand formatted string
     */
    public static String formatShorthand(BigDecimal amount) {
        if (amount == null) {
            return RUPEE_SYMBOL + "0";
        }

        boolean isNegative = amount.compareTo(BigDecimal.ZERO) < 0;
        BigDecimal abs = amount.abs();
        String prefix = isNegative ? "-" + RUPEE_SYMBOL : RUPEE_SYMBOL;

        if (abs.compareTo(ONE_CRORE) >= 0) {
            BigDecimal crores = abs.divide(ONE_CRORE, 2, RoundingMode.HALF_UP);
            return prefix + stripTrailingZeros(crores) + " Cr";
        } else if (abs.compareTo(ONE_LAKH) >= 0) {
            BigDecimal lakhs = abs.divide(ONE_LAKH, 2, RoundingMode.HALF_UP);
            return prefix + stripTrailingZeros(lakhs) + " L";
        } else if (abs.compareTo(ONE_THOUSAND) >= 0) {
            BigDecimal thousands = abs.divide(ONE_THOUSAND, 1, RoundingMode.HALF_UP);
            return prefix + stripTrailingZeros(thousands) + " K";
        } else {
            return formatINR(amount, false);
        }
    }

    private static String stripTrailingZeros(BigDecimal val) {
        String str = val.toPlainString();
        if (str.contains(".")) {
            str = str.replaceAll("0+$", "").replaceAll("\\.$", "");
        }
        return str;
    }

    /**
     * Formats integer part into 2-2-3 Indian digit groupings.
     * e.g., 12345678 -> "1,23,45,678"
     */
    public static String formatIndianGrouping(long n) {
        if (n == 0) {
            return "0";
        }

        String str = Long.toString(n);
        int len = str.length();

        if (len <= 3) {
            return str;
        }

        // The last 3 digits
        String lastThree = str.substring(len - 3);
        String remaining = str.substring(0, len - 3);

        StringBuilder sb = new StringBuilder();
        int remLen = remaining.length();

        // Process remaining in 2-digit chunks from right to left
        int firstChunkLen = remLen % 2 == 0 ? 2 : 1;
        sb.append(remaining, 0, firstChunkLen);

        for (int i = firstChunkLen; i < remLen; i += 2) {
            sb.append(",").append(remaining, i, i + 2);
        }

        sb.append(",").append(lastThree);
        return sb.toString();
    }
}
