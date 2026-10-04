package com.infinance.metals.provider;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.infinance.metals.config.MetalsProperties;
import com.infinance.metals.dto.CacheStatus;
import com.infinance.metals.dto.MetalPriceDto;
import com.infinance.metals.dto.MetalsMarketResponseDto;
import com.infinance.metals.exception.MetalsProviderException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "infinance.metals.provider", havingValue = "metals-dev", matchIfMissing = true)
public class MetalsDevDataProvider implements MetalsDataProvider {

    private static final Logger log = LoggerFactory.getLogger(MetalsDevDataProvider.class);

    private final MetalsProperties properties;
    private final RestClient restClient;

    @org.springframework.beans.factory.annotation.Autowired
    public MetalsDevDataProvider(MetalsProperties properties) {
        this(properties, createDefaultRestClient(properties));
    }

    public MetalsDevDataProvider(MetalsProperties properties, RestClient restClient) {
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

        String authority = properties.getAuthority() != null && !properties.getAuthority().isBlank()
                ? properties.getAuthority()
                : "mcx";
        String currency = properties.getBaseCurrency() != null && !properties.getBaseCurrency().isBlank()
                ? properties.getBaseCurrency()
                : "INR";
        String unit = properties.getUnit() != null && !properties.getUnit().isBlank()
                ? properties.getUnit()
                : "g";

        String loggableUri = properties.getBaseUrl() + "/v1/metal/authority?authority=" + authority
                + "&currency=" + currency + "&unit=" + unit;
        log.debug("Fetching live metal reference quotes from metals.dev: {}", loggableUri);

        String fullUri = properties.getBaseUrl() + "/v1/metal/authority?api_key=" + apiKey
                + "&authority=" + authority + "&currency=" + currency + "&unit=" + unit;

        try {
            MetalsDevApiResponse response = restClient.get()
                    .uri(fullUri)
                    .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                    .retrieve()
                    .body(MetalsDevApiResponse.class);

            if (response == null) {
                throw new MetalsProviderException("Provider returned empty body");
            }

            return normalize(response, properties, Instant.now());
        } catch (MetalsProviderException ex) {
            log.warn("Metals.dev provider validation failed: {}", ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            log.warn("Failed to retrieve metals quotes from metals.dev provider: {} - {}",
                    ex.getClass().getSimpleName(), ex.getMessage());
            throw new MetalsProviderException("Upstream market data provider call failed", ex);
        }
    }

    public static MetalsMarketResponseDto normalize(MetalsDevApiResponse response, MetalsProperties properties, Instant fetchedAt) {
        if (response.status() == null || !"success".equalsIgnoreCase(response.status())) {
            throw new MetalsProviderException("Provider reported failure: status is not success (" + response.status() + ")");
        }

        Map<String, BigDecimal> rates = response.rates();
        if (rates == null || rates.isEmpty()) {
            throw new MetalsProviderException("Provider response does not contain exchange rates");
        }

        BigDecimal mcxGold = rates.get("mcx_gold");
        if (mcxGold == null || mcxGold.compareTo(BigDecimal.ZERO) <= 0) {
            throw new MetalsProviderException("Missing or non-positive rate for mcx_gold");
        }

        BigDecimal mcxSilver = rates.get("mcx_silver");
        if (mcxSilver == null || mcxSilver.compareTo(BigDecimal.ZERO) <= 0) {
            throw new MetalsProviderException("Missing or non-positive rate for mcx_silver");
        }

        Instant sourceTimestamp = fetchedAt;
        if (response.timestamp() != null && !response.timestamp().isBlank()) {
            try {
                sourceTimestamp = Instant.parse(response.timestamp());
            } catch (Exception e) {
                log.debug("Unable to parse timestamp string '{}', falling back to fetchedAt", response.timestamp());
            }
        }

        List<MetalPriceDto> items = new ArrayList<>();

        // Gold (MCX 99.5%)
        BigDecimal goldPricePerGramInr = mcxGold.setScale(2, RoundingMode.HALF_UP);
        BigDecimal goldPricePer10GramsInr = goldPricePerGramInr.multiply(BigDecimal.TEN).setScale(2, RoundingMode.HALF_UP);
        BigDecimal indicative22kPerGramInr = mcxGold.multiply(new BigDecimal("22"))
                .divide(new BigDecimal("24"), 2, RoundingMode.HALF_UP);
        BigDecimal indicative22kPer10GramsInr = indicative22kPerGramInr.multiply(BigDecimal.TEN).setScale(2, RoundingMode.HALF_UP);

        items.add(new MetalPriceDto(
                "XAU",
                "XAU",
                "Gold (MCX)",
                "MCX Reference (99.5%)",
                goldPricePerGramInr,
                goldPricePer10GramsInr,
                indicative22kPerGramInr,
                indicative22kPer10GramsInr,
                sourceTimestamp,
                fetchedAt,
                CacheStatus.LIVE,
                properties.getProviderLabel(),
                properties.getDisclaimer()
        ));

        // Silver (MCX)
        BigDecimal silverPricePerGramInr = mcxSilver.setScale(2, RoundingMode.HALF_UP);
        BigDecimal silverPricePer10GramsInr = silverPricePerGramInr.multiply(BigDecimal.TEN).setScale(2, RoundingMode.HALF_UP);

        items.add(new MetalPriceDto(
                "XAG",
                "XAG",
                "Silver",
                "MCX Reference",
                silverPricePerGramInr,
                silverPricePer10GramsInr,
                null,
                null,
                sourceTimestamp,
                fetchedAt,
                CacheStatus.LIVE,
                properties.getProviderLabel(),
                properties.getDisclaimer()
        ));

        return new MetalsMarketResponseDto(
                items,
                fetchedAt,
                CacheStatus.LIVE,
                properties.getProviderLabel(),
                properties.getDisclaimer()
        );
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MetalsDevApiResponse(
            String status,
            String authority,
            String currency,
            String unit,
            String timestamp,
            Map<String, BigDecimal> rates
    ) {}
}
