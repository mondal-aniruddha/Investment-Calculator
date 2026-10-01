package com.infinance.metals.service;

import com.infinance.metals.config.MetalsProperties;
import com.infinance.metals.dto.CacheStatus;
import com.infinance.metals.dto.MetalPriceDto;
import com.infinance.metals.dto.MetalsMarketResponseDto;
import com.infinance.metals.exception.MetalsProviderException;
import com.infinance.metals.exception.MetalsServiceUnavailableException;
import com.infinance.metals.provider.MetalsDataProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MetalsMarketServiceTest {

    @Mock
    private MetalsDataProvider provider;

    private MetalsProperties properties;
    private MutableClock clock;
    private MetalsMarketService service;

    private MetalsMarketResponseDto sampleResponse;

    @BeforeEach
    void setUp() {
        properties = new MetalsProperties();
        properties.setCacheTtlMinutes(5);
        properties.setStaleTtlHours(24);
        properties.setSymbols("XAU,XAG,XPT,XPD");
        properties.setBaseCurrency("INR");
        properties.setUnit("g");
        properties.setProviderLabel("Metals-API");
        properties.setDisclaimer("Indicative reference price");

        clock = new MutableClock(Instant.parse("2026-10-01T10:00:00Z"));
        service = new MetalsMarketService(provider, properties, clock);

        List<MetalPriceDto> items = List.of(
                new MetalPriceDto("XAU", "XAU", "Gold", "24K", new BigDecimal("7500.00"), new BigDecimal("75000.00"),
                        new BigDecimal("6875.00"), new BigDecimal("68750.00"), clock.instant(), clock.instant(),
                        CacheStatus.LIVE, "Metals-API", "Disclaimer"),
                new MetalPriceDto("XAG", "XAG", "Silver", "99.9%", new BigDecimal("92.00"), null,
                        null, null, clock.instant(), clock.instant(),
                        CacheStatus.LIVE, "Metals-API", "Disclaimer")
        );
        sampleResponse = new MetalsMarketResponseDto(items, clock.instant(), CacheStatus.LIVE, "Metals-API", "Disclaimer");
    }

    @Test
    @DisplayName("Initial request should fetch from provider and return LIVE status")
    void shouldReturnLiveOnInitialFetch() {
        when(provider.fetchLatestRates()).thenReturn(sampleResponse);

        MetalsMarketResponseDto result = service.getMetalsPrices();

        assertThat(result).isNotNull();
        assertThat(result.cacheStatus()).isEqualTo(CacheStatus.LIVE);
        assertThat(result.metals().getFirst().cacheStatus()).isEqualTo(CacheStatus.LIVE);
        verify(provider, times(1)).fetchLatestRates();
    }

    @Test
    @DisplayName("Subsequent request within 5 minutes should return CACHED status without calling provider")
    void shouldReturnCachedWithinFreshTtl() {
        when(provider.fetchLatestRates()).thenReturn(sampleResponse);

        MetalsMarketResponseDto first = service.getMetalsPrices();
        assertThat(first.cacheStatus()).isEqualTo(CacheStatus.LIVE);

        // Advance 3 minutes (less than 5-minute fresh TTL)
        clock.advance(Duration.ofMinutes(3));

        MetalsMarketResponseDto second = service.getMetalsPrices();
        assertThat(second.cacheStatus()).isEqualTo(CacheStatus.CACHED);
        assertThat(second.metals().getFirst().cacheStatus()).isEqualTo(CacheStatus.CACHED);
        verify(provider, times(1)).fetchLatestRates();
    }

    @Test
    @DisplayName("Request after 5 minutes should re-fetch from provider and return LIVE")
    void shouldRefetchAfterFreshTtlExpires() {
        when(provider.fetchLatestRates()).thenReturn(sampleResponse);

        service.getMetalsPrices();

        // Advance 6 minutes
        clock.advance(Duration.ofMinutes(6));

        MetalsMarketResponseDto refreshed = service.getMetalsPrices();
        assertThat(refreshed.cacheStatus()).isEqualTo(CacheStatus.LIVE);
        verify(provider, times(2)).fetchLatestRates();
    }

    @Test
    @DisplayName("When provider fails after initial successful fetch, should return STALE cached data up to 24 hours")
    void shouldReturnStaleOnProviderFailureWhenCached() {
        when(provider.fetchLatestRates())
                .thenReturn(sampleResponse)
                .thenThrow(new MetalsProviderException("Upstream timeout"));
        when(provider.getProviderName()).thenReturn("Metals-API");

        // First call succeeds
        service.getMetalsPrices();

        // Advance 10 minutes (past fresh TTL)
        clock.advance(Duration.ofMinutes(10));

        // Second call: provider fails, but cached data within 24 hours is returned as STALE
        MetalsMarketResponseDto stale = service.getMetalsPrices();
        assertThat(stale).isNotNull();
        assertThat(stale.cacheStatus()).isEqualTo(CacheStatus.STALE);
        assertThat(stale.metals().getFirst().cacheStatus()).isEqualTo(CacheStatus.STALE);
        assertThat(stale.metals().getFirst().pricePerGramInr()).isEqualTo(new BigDecimal("7500.00"));
    }

    @Test
    @DisplayName("When provider fails and NO cached data exists, should throw MetalsServiceUnavailableException")
    void shouldThrowServiceUnavailableWhenNoCacheExists() {
        when(provider.fetchLatestRates()).thenThrow(new MetalsProviderException("Connection refused"));
        when(provider.getProviderName()).thenReturn("Metals-API");

        assertThatThrownBy(() -> service.getMetalsPrices())
                .isInstanceOf(MetalsServiceUnavailableException.class)
                .hasMessageContaining("Live metal reference prices are temporarily unavailable");
    }

    @Test
    @DisplayName("When provider fails and cached data is older than 24 hours, should throw MetalsServiceUnavailableException")
    void shouldThrowServiceUnavailableWhenStaleTtlExpired() {
        when(provider.fetchLatestRates())
                .thenReturn(sampleResponse)
                .thenThrow(new MetalsProviderException("Provider 500 error"));
        when(provider.getProviderName()).thenReturn("Metals-API");

        // Initial fetch
        service.getMetalsPrices();

        // Advance 25 hours (past 24-hr stale limit)
        clock.advance(Duration.ofHours(25));

        assertThatThrownBy(() -> service.getMetalsPrices())
                .isInstanceOf(MetalsServiceUnavailableException.class);
    }

    private static class MutableClock extends Clock {
        private Instant current;
        private final ZoneId zone = ZoneId.of("UTC");

        MutableClock(Instant start) {
            this.current = start;
        }

        void advance(Duration duration) {
            this.current = current.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return zone;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return current;
        }
    }
}
