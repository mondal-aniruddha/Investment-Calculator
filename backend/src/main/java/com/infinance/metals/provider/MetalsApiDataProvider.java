package com.infinance.metals.provider;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.infinance.metals.config.MetalsProperties;
import com.infinance.metals.dto.CacheStatus;
import com.infinance.metals.dto.MetalPriceDto;
import com.infinance.metals.dto.MetalsMarketResponseDto;
import com.infinance.metals.exception.MetalsProviderException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "infinance.metals.provider", havingValue = "metals-api")
public class MetalsApiDataProvider implements MetalsDataProvider {

    private static final Logger log = LoggerFactory.getLogger(MetalsApiDataProvider.class);

    /**
     * Standard troy ounce to gram conversion factor: 1 troy ounce = 31.1034768 grams.
     */
    public static final BigDecimal TROY_OUNCE_TO_GRAMS = new BigDecimal("31.1034768");

    private final MetalsProperties properties;
    private final RestClient restClient;

    @org.springframework.beans.factory.annotation.Autowired
    public MetalsApiDataProvider(MetalsProperties properties) {
        this(properties, createDefaultRestClient(properties));
    }

    public MetalsApiDataProvider(MetalsProperties properties, RestClient restClient) {
        this.properties = properties;
        this.restClient = restClient;
    }

    private static RestClient createDefaultRestClient(MetalsProperties properties) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(properties.getConnectTimeoutMs());
        factory.setReadTimeout(properties.getReadTimeoutMs());
        return RestClient.builder().requestFactory(factory).build();
    }

    @Override
    public String getProviderName() {
        return properties.getProviderLabel();
    }

    @Override
    public MetalsMarketResponseDto fetchLatestRates() {
        String apiKey = properties.getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new MetalsProviderException("Metals provider API key is not configured. Set INFINANCE_METALS_API_KEY.");
        }

        // Build safe request URL for logging (without access_key)
        String loggableUri = properties.getBaseUrl() + "/latest?base=" + properties.getBaseCurrency()
                + "&symbols=" + properties.getSymbols()
                + "&unit=" + properties.getUnit();
        log.debug("Fetching live metal reference quotes from provider: {}", loggableUri);

        String fullUri = properties.getBaseUrl() + "/latest?access_key=" + apiKey
                + "&base=" + properties.getBaseCurrency()
                + "&symbols=" + properties.getSymbols()
                + (properties.getUnit() != null && !properties.getUnit().isBlank() ? "&unit=" + properties.getUnit() : "");

        try {
            MetalsApiResponse response = restClient.get()
                    .uri(fullUri)
                    .retrieve()
                    .body(MetalsApiResponse.class);

            if (response == null) {
                throw new MetalsProviderException("Provider returned empty body");
            }

            return normalize(response, properties, Instant.now());
        } catch (MetalsProviderException ex) {
            log.warn("Metals provider validation failed: {}", ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            log.warn("Failed to retrieve metals quotes from upstream provider: {} - {}",
                    ex.getClass().getSimpleName(), ex.getMessage());
            throw new MetalsProviderException("Upstream market data provider call failed", ex);
        }
    }

    /**
     * Normalizes raw Metals-API response to project standard DTO.
     * Handles unit conversion (toz to grams) and rate direction (INVERSE or DIRECT).
     */
    public static MetalsMarketResponseDto normalize(MetalsApiResponse response, MetalsProperties properties, Instant fetchedAt) {
        if (response.success() != null && !response.success()) {
            String errorInfo = response.error() != null ? response.error().info() : "Unknown provider failure";
            throw new MetalsProviderException("Provider reported failure: " + errorInfo);
        }

        Map<String, BigDecimal> rates = response.rates();
        if (rates == null || rates.isEmpty()) {
            throw new MetalsProviderException("Provider response does not contain exchange rates");
        }

        Instant sourceTimestamp = response.timestamp() != null
                ? Instant.ofEpochSecond(response.timestamp())
                : fetchedAt;

        List<MetalPriceDto> items = new ArrayList<>();
        List<String> requiredSymbols = properties.getSymbolList();

        for (String rawSymbol : requiredSymbols) {
            String symbol = rawSymbol.toUpperCase();
            BigDecimal rawRate = rates.get(symbol);
            if (rawRate == null || rawRate.compareTo(BigDecimal.ZERO) <= 0) {
                throw new MetalsProviderException("Missing or non-positive rate for required metal: " + symbol);
            }

            BigDecimal priceInBase;
            if (properties.getRateDirection() == MetalsProperties.RateDirection.INVERSE) {
                priceInBase = BigDecimal.ONE.divide(rawRate, 8, RoundingMode.HALF_UP);
            } else {
                priceInBase = rawRate;
            }

            // Normalize to per gram
            String unit = response.unit() != null && !response.unit().isBlank() ? response.unit() : properties.getUnit();
            BigDecimal pricePerGram;
            if ("toz".equalsIgnoreCase(unit) || "troy_ounce".equalsIgnoreCase(unit)) {
                pricePerGram = priceInBase.divide(TROY_OUNCE_TO_GRAMS, 4, RoundingMode.HALF_UP);
            } else {
                pricePerGram = priceInBase;
            }

            BigDecimal pricePerGramInr = pricePerGram.setScale(2, RoundingMode.HALF_UP);
            BigDecimal pricePer10GramsInr = null;
            BigDecimal indicative22kPerGramInr = null;
            BigDecimal indicative22kPer10GramsInr = null;
            String displayName;
            String purity;

            switch (symbol) {
                case "XAU" -> {
                    displayName = "Gold";
                    purity = "24K (99.9% Spot Reference)";
                    pricePer10GramsInr = pricePerGramInr.multiply(BigDecimal.TEN).setScale(2, RoundingMode.HALF_UP);
                    // Indicative 22K purity calculation: 22/24 of 24K spot price
                    indicative22kPerGramInr = pricePerGramInr.multiply(new BigDecimal("22"))
                            .divide(new BigDecimal("24"), 2, RoundingMode.HALF_UP);
                    indicative22kPer10GramsInr = indicative22kPerGramInr.multiply(BigDecimal.TEN).setScale(2, RoundingMode.HALF_UP);
                }
                case "XAG" -> {
                    displayName = "Silver";
                    purity = "99.9% Spot Reference";
                }
                case "XPT" -> {
                    displayName = "Platinum";
                    purity = "99.95% Spot Reference";
                }
                case "XPD" -> {
                    displayName = "Palladium";
                    purity = "99.95% Spot Reference";
                }
                default -> {
                    displayName = symbol;
                    purity = "Reference";
                }
            }

            items.add(new MetalPriceDto(
                    symbol,
                    symbol,
                    displayName,
                    purity,
                    pricePerGramInr,
                    pricePer10GramsInr,
                    indicative22kPerGramInr,
                    indicative22kPer10GramsInr,
                    sourceTimestamp,
                    fetchedAt,
                    CacheStatus.LIVE,
                    properties.getProviderLabel(),
                    properties.getDisclaimer()
            ));
        }

        return new MetalsMarketResponseDto(
                items,
                fetchedAt,
                CacheStatus.LIVE,
                properties.getProviderLabel(),
                properties.getDisclaimer()
        );
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MetalsApiResponse(
            Boolean success,
            Long timestamp,
            String date,
            String base,
            String unit,
            Map<String, BigDecimal> rates,
            MetalsApiError error
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MetalsApiError(
            Integer code,
            String type,
            String info
    ) {}
}
