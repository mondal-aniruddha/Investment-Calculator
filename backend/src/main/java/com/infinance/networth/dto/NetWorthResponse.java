package com.infinance.networth.dto;
import com.infinance.common.dto.BaseAssumptionsDto;
import java.math.BigDecimal;
import java.util.List;
public record NetWorthResponse(BigDecimal totalAssets, BigDecimal totalLiabilities, BigDecimal netWorth,
                               List<Allocation> allocation, List<NetWorthRequest.Snapshot> history, BaseAssumptionsDto assumptions) {
    public record Allocation(String category, BigDecimal amount, BigDecimal percentage) {}
}
