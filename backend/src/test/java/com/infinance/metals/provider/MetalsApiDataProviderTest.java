package com.infinance.metals.provider;

import com.infinance.metals.config.MetalsProperties;
import com.infinance.metals.dto.CacheStatus;
import com.infinance.metals.dto.MetalPriceDto;
import com.infinance.metals.dto.MetalsMarketResponseDto;
import com.infinance.metals.exception.MetalsProviderException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MetalsApiDataProviderTest {

    private MetalsProperties properties;

    @BeforeEach
    void setUp() {
        properties = new MetalsProperties();
        properties.setApiKey("test-api-key");
        properties.setBaseCurrency("INR");
        properties.setSymbols("XAU,XAG,XPT,XPD");
        properties.setUnit("g");
        properties.setRateDirection(MetalsProperties.RateDirection.INVERSE);
    }

    @Test
    @DisplayName("Should normalize inverse rate quotes per gram into INR/g and INR/10g")
    void shouldNormalizeInverseQuotesPerGram() {
        // e.g. 1 INR = 0.00013333 g of gold -> price = 1 / 0.00013333 = 7500.19 INR/g
        Map<String, BigDecimal> rates = Map.of(
                "XAU", new BigDecimal("0.00013333"),
                "XAG", new BigDecimal("0.01086957"), // 1 / 0.01086957 = 92.00 INR/g
                "XPT", new BigDecimal("0.00037313"), // 1 / 0.00037313 = 2680.03 INR/g
                "XPD", new BigDecimal("0.00035088")  // 1 / 0.00035088 = 2849.98 INR/g
        );

        MetalsApiDataProvider.MetalsApiResponse apiResponse = new MetalsApiDataProvider.MetalsApiResponse(
                true,
                1727800000L,
                "2026-10-01",
                "INR",
                "g",
                rates,
                null
        );

        Instant fetchedAt = Instant.now();
        MetalsMarketResponseDto result = MetalsApiDataProvider.normalize(apiResponse, properties, fetchedAt);

        assertThat(result).isNotNull();
        assertThat(result.cacheStatus()).isEqualTo(CacheStatus.LIVE);
        assertThat(result.metals()).hasSize(4);

        MetalPriceDto gold = result.metals().stream().filter(m -> m.metalCode().equals("XAU")).findFirst().orElseThrow();
        assertThat(gold.displayName()).isEqualTo("Gold");
        assertThat(gold.purity()).contains("24K");
        assertThat(gold.pricePerGramInr()).isEqualTo(new BigDecimal("7500.19"));
        assertThat(gold.pricePer10GramsInr()).isEqualTo(new BigDecimal("75001.90"));
        // 22K indicative: 7500.19 * 22 / 24 = 6875.17
        BigDecimal expected22kPerGram = new BigDecimal("7500.19").multiply(new BigDecimal("22")).divide(new BigDecimal("24"), 2, RoundingMode.HALF_UP);
        assertThat(gold.indicative22kPerGramInr()).isEqualTo(expected22kPerGram);
        assertThat(gold.indicative22kPer10GramsInr()).isEqualTo(expected22kPerGram.multiply(BigDecimal.TEN).setScale(2, RoundingMode.HALF_UP));

        MetalPriceDto silver = result.metals().stream().filter(m -> m.metalCode().equals("XAG")).findFirst().orElseThrow();
        assertThat(silver.displayName()).isEqualTo("Silver");
        assertThat(silver.pricePerGramInr()).isEqualTo(new BigDecimal("92.00"));
        assertThat(silver.pricePer10GramsInr()).isNull();
        assertThat(silver.indicative22kPerGramInr()).isNull();

        MetalPriceDto platinum = result.metals().stream().filter(m -> m.metalCode().equals("XPT")).findFirst().orElseThrow();
        assertThat(platinum.pricePerGramInr()).isEqualTo(new BigDecimal("2680.03"));

        MetalPriceDto palladium = result.metals().stream().filter(m -> m.metalCode().equals("XPD")).findFirst().orElseThrow();
        assertThat(palladium.pricePerGramInr()).isEqualTo(new BigDecimal("2849.98"));
    }

    @Test
    @DisplayName("Should normalize direct rate quotes per gram into INR/g")
    void shouldNormalizeDirectQuotesPerGram() {
        properties.setRateDirection(MetalsProperties.RateDirection.DIRECT);

        Map<String, BigDecimal> rates = Map.of(
                "XAU", new BigDecimal("7450.50"),
                "XAG", new BigDecimal("91.25"),
                "XPT", new BigDecimal("2650.00"),
                "XPD", new BigDecimal("2800.00")
        );

        MetalsApiDataProvider.MetalsApiResponse apiResponse = new MetalsApiDataProvider.MetalsApiResponse(
                true,
                1727800000L,
                "2026-10-01",
                "INR",
                "g",
                rates,
                null
        );

        MetalsMarketResponseDto result = MetalsApiDataProvider.normalize(apiResponse, properties, Instant.now());
        MetalPriceDto gold = result.metals().stream().filter(m -> m.metalCode().equals("XAU")).findFirst().orElseThrow();
        assertThat(gold.pricePerGramInr()).isEqualTo(new BigDecimal("7450.50"));
        assertThat(gold.pricePer10GramsInr()).isEqualTo(new BigDecimal("74505.00"));
        // 22K = 7450.50 * 22 / 24 = 6829.63
        assertThat(gold.indicative22kPerGramInr()).isEqualTo(new BigDecimal("6829.63"));
    }

    @Test
    @DisplayName("Should convert troy ounces to grams when unit is toz")
    void shouldConvertTroyOuncesToGrams() {
        properties.setRateDirection(MetalsProperties.RateDirection.DIRECT);
        properties.setUnit("toz");

        // 1 troy ounce = 31.1034768 grams.
        // If 1 troy ounce of gold costs 231,739.00 INR, then 1 gram = 231,739 / 31.1034768 = 7,450.58 INR
        Map<String, BigDecimal> rates = Map.of(
                "XAU", new BigDecimal("231739.00"),
                "XAG", new BigDecimal("2838.00"),
                "XPT", new BigDecimal("82424.00"),
                "XPD", new BigDecimal("87089.00")
        );

        MetalsApiDataProvider.MetalsApiResponse apiResponse = new MetalsApiDataProvider.MetalsApiResponse(
                true,
                1727800000L,
                "2026-10-01",
                "INR",
                "toz",
                rates,
                null
        );

        MetalsMarketResponseDto result = MetalsApiDataProvider.normalize(apiResponse, properties, Instant.now());
        MetalPriceDto gold = result.metals().stream().filter(m -> m.metalCode().equals("XAU")).findFirst().orElseThrow();
        assertThat(gold.pricePerGramInr()).isEqualTo(new BigDecimal("7450.58"));
    }

    @Test
    @DisplayName("Should throw MetalsProviderException when provider reports failure")
    void shouldRejectProviderErrorReport() {
        MetalsApiDataProvider.MetalsApiResponse errorResponse = new MetalsApiDataProvider.MetalsApiResponse(
                false,
                null,
                null,
                null,
                null,
                null,
                new MetalsApiDataProvider.MetalsApiError(101, "invalid_access_key", "Invalid key provided")
        );

        assertThatThrownBy(() -> MetalsApiDataProvider.normalize(errorResponse, properties, Instant.now()))
                .isInstanceOf(MetalsProviderException.class)
                .hasMessageContaining("Invalid key provided");
    }

    @Test
    @DisplayName("Should reject missing or non-positive rates")
    void shouldRejectNonPositiveRates() {
        Map<String, BigDecimal> ratesWithNegative = Map.of(
                "XAU", new BigDecimal("-10.0"),
                "XAG", new BigDecimal("90.0"),
                "XPT", new BigDecimal("2600.0"),
                "XPD", new BigDecimal("2800.0")
        );

        MetalsApiDataProvider.MetalsApiResponse response = new MetalsApiDataProvider.MetalsApiResponse(
                true, 1727800000L, "2026-10-01", "INR", "g", ratesWithNegative, null
        );

        assertThatThrownBy(() -> MetalsApiDataProvider.normalize(response, properties, Instant.now()))
                .isInstanceOf(MetalsProviderException.class)
                .hasMessageContaining("Missing or non-positive rate");
    }

    @Test
    @DisplayName("Should reject response when required symbols are absent")
    void shouldRejectMissingSymbols() {
        Map<String, BigDecimal> partialRates = new HashMap<>();
        partialRates.put("XAU", new BigDecimal("7500.0"));
        // XAG, XPT, XPD missing

        MetalsApiDataProvider.MetalsApiResponse response = new MetalsApiDataProvider.MetalsApiResponse(
                true, 1727800000L, "2026-10-01", "INR", "g", partialRates, null
        );

        assertThatThrownBy(() -> MetalsApiDataProvider.normalize(response, properties, Instant.now()))
                .isInstanceOf(MetalsProviderException.class)
                .hasMessageContaining("Missing or non-positive rate");
    }

    @Test
    @DisplayName("Should throw MetalsProviderException when API key is missing")
    void shouldFailWhenApiKeyIsMissing() {
        properties.setApiKey("");
        MetalsApiDataProvider provider = new MetalsApiDataProvider(properties);

        assertThatThrownBy(provider::fetchLatestRates)
                .isInstanceOf(MetalsProviderException.class)
                .hasMessageContaining("Metals provider API key is not configured");
    }
}
