package com.infinance.simulation.dto;
import com.infinance.common.dto.BaseAssumptionsDto;
import java.math.BigDecimal;
import java.util.List;
public record MonteCarloResponse(int runs, BigDecimal successProbabilityPercent,
        BigDecimal percentile10, BigDecimal percentile50, BigDecimal percentile90,
        List<BandPoint> percentileBands, BaseAssumptionsDto assumptions) {
    public record BandPoint(int year, BigDecimal percentile10, BigDecimal percentile50, BigDecimal percentile90) {}
}
