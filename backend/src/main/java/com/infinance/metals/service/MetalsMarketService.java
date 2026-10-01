package com.infinance.metals.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.infinance.metals.config.MetalsProperties;
import com.infinance.metals.dto.CacheStatus;
import com.infinance.metals.dto.MetalsMarketResponseDto;
import com.infinance.metals.exception.MetalsServiceUnavailableException;
import com.infinance.metals.provider.MetalsDataProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

@Service
public class MetalsMarketService {

    private static final Logger log = LoggerFactory.getLogger(MetalsMarketService.class);

    private final MetalsDataProvider provider;
    private final MetalsProperties properties;
    private final Clock clock;
    private final Cache<String, CachedEntry> cache;

    @org.springframework.beans.factory.annotation.Autowired
    public MetalsMarketService(MetalsDataProvider provider, MetalsProperties properties) {
        this(provider, properties, Clock.systemUTC());
    }

    public MetalsMarketService(MetalsDataProvider provider, MetalsProperties properties, Clock clock) {
        this.provider = provider;
        this.properties = properties;
        this.clock = clock;
        this.cache = Caffeine.newBuilder()
                .maximumSize(50)
                .expireAfterWrite(Duration.ofHours(properties.getStaleTtlHours() + 1))
                .build();
    }

    public MetalsMarketResponseDto getMetalsPrices() {
        String cacheKey = computeCacheKey();
        CachedEntry cached = cache.getIfPresent(cacheKey);
        Instant now = clock.instant();

        if (cached != null && now.isBefore(cached.freshUntil())) {
            return cached.data().withCacheStatus(CacheStatus.CACHED);
        }

        // Fresh TTL has expired or no cache exists. Prevent dog-piling with synchronized fetch.
        synchronized (this) {
            cached = cache.getIfPresent(cacheKey);
            if (cached != null && now.isBefore(cached.freshUntil())) {
                return cached.data().withCacheStatus(CacheStatus.CACHED);
            }

            try {
                MetalsMarketResponseDto fresh = provider.fetchLatestRates();
                if (fresh == null || fresh.metals() == null || fresh.metals().isEmpty()) {
                    throw new IllegalStateException("Provider returned empty metal rate list");
                }

                Instant freshUntil = now.plus(Duration.ofMinutes(properties.getCacheTtlMinutes()));
                Instant staleUntil = now.plus(Duration.ofHours(properties.getStaleTtlHours()));
                CachedEntry entry = new CachedEntry(fresh, freshUntil, staleUntil);
                cache.put(cacheKey, entry);
                return fresh.withCacheStatus(CacheStatus.LIVE);
            } catch (Exception ex) {
                log.warn("Failed to fetch fresh metals market data from {}: {}",
                        provider.getProviderName(), ex.getClass().getSimpleName());

                if (cached != null && now.isBefore(cached.staleUntil())) {
                    log.info("Serving stale cached metals data fetched at {} (valid until {})",
                            cached.data().fetchedAt(), cached.staleUntil());
                    return cached.data().withCacheStatus(CacheStatus.STALE);
                }

                throw new MetalsServiceUnavailableException("Live metal reference prices are temporarily unavailable. Please try again later.", ex);
            }
        }
    }

    public void clearCache() {
        cache.invalidateAll();
    }

    private String computeCacheKey() {
        return properties.getSymbols() + ":" + properties.getBaseCurrency() + ":" + properties.getUnit() + ":" + properties.getRateDirection();
    }

    public record CachedEntry(
            MetalsMarketResponseDto data,
            Instant freshUntil,
            Instant staleUntil
    ) {}
}
