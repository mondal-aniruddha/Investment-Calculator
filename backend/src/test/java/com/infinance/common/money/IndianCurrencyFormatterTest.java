package com.infinance.common.money;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class IndianCurrencyFormatterTest {

    @Test
    @DisplayName("Should format zero and null values correctly")
    void shouldFormatZeroAndNull() {
        assertThat(IndianCurrencyFormatter.formatINR(BigDecimal.ZERO)).isEqualTo("₹0");
        assertThat(IndianCurrencyFormatter.formatINR(null)).isEqualTo("₹0");
        assertThat(IndianCurrencyFormatter.formatShorthand(BigDecimal.ZERO)).isEqualTo("₹0");
        assertThat(IndianCurrencyFormatter.formatShorthand(null)).isEqualTo("₹0");
    }

    @ParameterizedTest(name = "Amount {0} should format to {1}")
    @CsvSource({
            "500, '₹500'",
            "1000, '₹1,000'",
            "10000, '₹10,000'",
            "100000, '₹1,00,000'",
            "1234567, '₹12,34,567'",
            "10000000, '₹1,00,00,000'",
            "123456789, '₹12,34,56,789'"
    })
    @DisplayName("Should correctly group digits in Indian 2-2-3 numbering format")
    void shouldFormatIndianNumberingGrouping(String input, String expected) {
        assertThat(IndianCurrencyFormatter.formatINR(new BigDecimal(input))).isEqualTo(expected);
    }

    @Test
    @DisplayName("Should include two decimal places when requested")
    void shouldFormatWithDecimals() {
        BigDecimal val = new BigDecimal("1234567.89");
        assertThat(IndianCurrencyFormatter.formatINR(val, true)).isEqualTo("₹12,34,567.89");
    }

    @Test
    @DisplayName("Should handle negative amounts with prefix minus")
    void shouldFormatNegativeAmounts() {
        BigDecimal negative = new BigDecimal("-54321");
        assertThat(IndianCurrencyFormatter.formatINR(negative)).isEqualTo("-₹54,321");
        assertThat(IndianCurrencyFormatter.formatShorthand(negative)).isEqualTo("-₹54.3 K");
    }

    @ParameterizedTest(name = "Amount {0} should shorthand format to {1}")
    @CsvSource({
            "500, '₹500'",
            "4500, '₹4.5 K'",
            "150000, '₹1.5 L'",
            "1234567, '₹12.35 L'",
            "10000000, '₹1 Cr'",
            "125000000, '₹12.5 Cr'"
    })
    @DisplayName("Should format Indian shorthand notations (K, L, Cr)")
    void shouldFormatShorthandCorrectly(String input, String expected) {
        assertThat(IndianCurrencyFormatter.formatShorthand(new BigDecimal(input))).isEqualTo(expected);
    }
}
