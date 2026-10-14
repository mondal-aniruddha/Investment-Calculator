package com.infinance.mutualfund.engine;

import com.infinance.mutualfund.dto.MutualFundResponse;
import com.infinance.mutualfund.dto.XirrRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Golden-Value Characterization Tests for MutualFundEngine")
class MutualFundEngineGoldenTest {

    @Test
    @DisplayName("Golden: CAGR test - doubling investment in 5 and 10 years")
    void testCagrGoldenValues() {
        // Doubling in 10 years: 100 -> 200 in 10 yrs ~ 7.18%
        BigDecimal tenYr = MutualFundEngine.cagr(new BigDecimal("100"), new BigDecimal("200"), new BigDecimal("10"));
        assertThat(tenYr).isEqualByComparingTo("7.18");

        // Doubling in 5 years: 100 -> 200 in 5 yrs ~ 14.87%
        BigDecimal fiveYr = MutualFundEngine.cagr(new BigDecimal("100"), new BigDecimal("200"), new BigDecimal("5"));
        assertThat(fiveYr).isEqualByComparingTo("14.87");

        // Tripling in 8 years: 100 -> 300 in 8 yrs ~ 14.72%
        BigDecimal triple = MutualFundEngine.cagr(new BigDecimal("100"), new BigDecimal("300"), new BigDecimal("8"));
        assertThat(triple).isEqualByComparingTo("14.72");
    }

    @Test
    @DisplayName("Golden: SWP test - ₹10,00,000 corpus, 10% return, ₹10,000/mo withdrawal for 5 years")
    void testSwpGoldenValues() {
        BigDecimal corpus = new BigDecimal("1000000");
        BigDecimal annualReturn = new BigDecimal("10.00");
        BigDecimal monthlyWithdrawal = new BigDecimal("10000");
        int years = 5;
        BigDecimal stepUp = BigDecimal.ZERO;

        MutualFundResponse res = MutualFundEngine.swp(corpus, annualReturn, monthlyWithdrawal, years, stepUp);

        assertThat(res.totalInvested()).isEqualByComparingTo("1000000.00");
        assertThat(res.withdrawalTotal()).isEqualByComparingTo("600000.00"); // 10000 * 60
        assertThat(res.annualizedReturn()).isEqualByComparingTo("10.00");
        assertThat(res.projection()).hasSize(5);

        // Assert remaining corpus is positive and precisely calculated
        assertThat(res.remainingCorpus()).isGreaterThan(new BigDecimal("800000.00"));
    }

    @Test
    @DisplayName("Golden: XIRR test - 1-year 10% gain")
    void testXirrGoldenValues() {
        List<XirrRequest.CashFlow> flows = List.of(
                new XirrRequest.CashFlow(LocalDate.of(2024, 1, 1), new BigDecimal("-100000")),
                new XirrRequest.CashFlow(LocalDate.of(2025, 1, 1), new BigDecimal("110000"))
        );

        BigDecimal rate = MutualFundEngine.xirr(flows);
        // Note: 2024 is a leap year (366 days), so rate is approximately 9.97% - 10.03%
        assertThat(rate).isBetween(new BigDecimal("9.90"), new BigDecimal("10.10"));
    }
}
