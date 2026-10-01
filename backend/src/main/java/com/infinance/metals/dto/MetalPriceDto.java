package com.infinance.metals.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MetalPriceDto(
        String metalCode,
        String symbol,
        String displayName,
        String purity,
        BigDecimal pricePerGramInr,
        BigDecimal pricePer10GramsInr,
        BigDecimal indicative22kPerGramInr,
        BigDecimal indicative22kPer10GramsInr,
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant sourceTimestamp,
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant fetchedAt,
        CacheStatus cacheStatus,
        String source,
        String disclaimer
) {
    public MetalPriceDto withCacheStatus(CacheStatus newStatus) {
        return new MetalPriceDto(
                metalCode,
                symbol,
                displayName,
                purity,
                pricePerGramInr,
                pricePer10GramsInr,
                indicative22kPerGramInr,
                indicative22kPer10GramsInr,
                sourceTimestamp,
                fetchedAt,
                newStatus,
                source,
                disclaimer
        );
    }
}
