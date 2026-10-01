package com.infinance.metals.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;
import java.util.List;

public record MetalsMarketResponseDto(
        List<MetalPriceDto> metals,
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant fetchedAt,
        CacheStatus cacheStatus,
        String source,
        String disclaimer
) {
    public MetalsMarketResponseDto withCacheStatus(CacheStatus newStatus) {
        List<MetalPriceDto> updatedMetals = metals != null ? metals.stream()
                .map(m -> m.withCacheStatus(newStatus))
                .toList() : List.of();
        return new MetalsMarketResponseDto(updatedMetals, fetchedAt, newStatus, source, disclaimer);
    }
}
