package com.infinance.networth.engine;
import com.infinance.networth.dto.*;
import java.math.*;
import java.util.*;
/** Pure net-worth aggregation: net worth = assets - liabilities; allocation is asset/category share. */
@SuppressWarnings("null")
public final class NetWorthEngine {
    private NetWorthEngine() {}
    public static NetWorthResponse calculate(NetWorthRequest r) {
        BigDecimal assets = r.assets().stream().map(NetWorthRequest.Item::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal liabilities = r.liabilities().stream().map(NetWorthRequest.Item::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, BigDecimal> byCategory = new LinkedHashMap<>();
        r.assets().forEach(i -> byCategory.merge(i.category(), i.amount(), BigDecimal::add));
        List<NetWorthResponse.Allocation> allocation = byCategory.entrySet().stream()
                .map(e -> new NetWorthResponse.Allocation(e.getKey(), e.getValue(),
                        assets.signum() == 0 ? BigDecimal.ZERO : e.getValue().multiply(BigDecimal.valueOf(100)).divide(assets, 2, RoundingMode.HALF_UP)))
                .toList();
        return new NetWorthResponse(assets.setScale(2, RoundingMode.HALF_UP), liabilities.setScale(2, RoundingMode.HALF_UP),
                assets.subtract(liabilities).setScale(2, RoundingMode.HALF_UP), allocation, r.history(), null);
    }
}
