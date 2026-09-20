package com.infinance.networth.engine;
import com.infinance.networth.dto.*;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
class NetWorthEngineTest {
    @Test void assetsMinusLiabilitiesIsNetWorth() {
        var r = new NetWorthRequest(List.of(new NetWorthRequest.Item("Cash", new BigDecimal("100"))),
                List.of(new NetWorthRequest.Item("Loan", new BigDecimal("40"))),
                List.of(new NetWorthRequest.Snapshot(LocalDate.of(2025, 1, 1), new BigDecimal("60"))));
        assertThat(NetWorthEngine.calculate(r).netWorth()).isEqualByComparingTo("60.00");
    }
}
