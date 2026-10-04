package com.infinance.metals.provider;

import com.infinance.metals.config.MetalsProperties;
import com.infinance.metals.dto.CacheStatus;
import com.infinance.metals.dto.MetalPriceDto;
import com.infinance.metals.dto.MetalsMarketResponseDto;
import com.infinance.metals.exception.MetalsProviderException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class MetalsDevDataProviderTest {

    private MetalsProperties properties;

    @BeforeEach
    void setUp() {
        properties = new MetalsProperties();
        properties.setProvider("metals-dev");
        properties.setApiKey("test-metals-dev-key");
        properties.setBaseUrl("https://api.metals.dev");
        properties.setAuthority("mcx");
        properties.setBaseCurrency("INR");
        properties.setUnit("g");
        properties.setProviderLabel("metals.dev");
        properties.setDisclaimer("Indicative MCX reference prices");
    }

    @Test
    @DisplayName("Should normalize metals.dev response into Gold (MCX) 24K, 22K indicative, and Silver in INR/g and INR/10g")
    void shouldNormalizeMetalsDevResponse() {
        Map<String, BigDecimal> rates = Map.of(
                "mcx_gold", new BigDecimal("15039.0001"),
                "mcx_silver", new BigDecimal("225.8769"),
                "mcx_gold_am", new BigDecimal("14777.0006"),
                "mcx_silver_am", new BigDecimal("221.4430")
        );

        MetalsDevDataProvider.MetalsDevApiResponse apiResponse = new MetalsDevDataProvider.MetalsDevApiResponse(
                "success",
                "mcx",
                "INR",
                "g",
                "2026-10-04T05:50:04.579Z",
                rates
        );

        Instant fetchedAt = Instant.parse("2026-10-04T06:00:00Z");
        MetalsMarketResponseDto result = MetalsDevDataProvider.normalize(apiResponse, properties, fetchedAt);

        assertThat(result).isNotNull();
        assertThat(result.cacheStatus()).isEqualTo(CacheStatus.LIVE);
        assertThat(result.source()).isEqualTo("metals.dev");
        assertThat(result.metals()).hasSize(2);

        MetalPriceDto gold = result.metals().stream().filter(m -> m.metalCode().equals("XAU")).findFirst().orElseThrow();
        assertThat(gold.displayName()).isEqualTo("Gold (MCX)");
        assertThat(gold.purity()).contains("MCX Reference (99.5%)");
        // 15039.0001 rounded to 2 decimal places = 15039.00
        assertThat(gold.pricePerGramInr()).isEqualTo(new BigDecimal("15039.00"));
        assertThat(gold.pricePer10GramsInr()).isEqualTo(new BigDecimal("150390.00"));
        // 22K indicative: 15039.0001 * 22 / 24 = 13785.75
        BigDecimal expected22kPerGram = new BigDecimal("15039.0001").multiply(new BigDecimal("22"))
                .divide(new BigDecimal("24"), 2, RoundingMode.HALF_UP);
        assertThat(gold.indicative22kPerGramInr()).isEqualTo(expected22kPerGram);
        assertThat(gold.indicative22kPer10GramsInr()).isEqualTo(expected22kPerGram.multiply(BigDecimal.TEN).setScale(2, RoundingMode.HALF_UP));
        assertThat(gold.sourceTimestamp()).isEqualTo(Instant.parse("2026-10-04T05:50:04.579Z"));

        MetalPriceDto silver = result.metals().stream().filter(m -> m.metalCode().equals("XAG")).findFirst().orElseThrow();
        assertThat(silver.displayName()).isEqualTo("Silver");
        assertThat(silver.purity()).isEqualTo("MCX Reference");
        // 225.8769 rounded = 225.88
        assertThat(silver.pricePerGramInr()).isEqualTo(new BigDecimal("225.88"));
        assertThat(silver.pricePer10GramsInr()).isEqualTo(new BigDecimal("2258.80"));
        assertThat(silver.indicative22kPerGramInr()).isNull();
    }

    @Test
    @DisplayName("Should throw MetalsProviderException when status is not success")
    void shouldThrowExceptionWhenStatusIsNotSuccess() {
        MetalsDevDataProvider.MetalsDevApiResponse response = new MetalsDevDataProvider.MetalsDevApiResponse(
                "error", "mcx", "INR", "g", null, null
        );

        assertThatThrownBy(() -> MetalsDevDataProvider.normalize(response, properties, Instant.now()))
                .isInstanceOf(MetalsProviderException.class)
                .hasMessageContaining("status is not success");
    }

    @Test
    @DisplayName("Should throw MetalsProviderException when mcx_gold rate is missing or non-positive")
    void shouldThrowExceptionWhenGoldRateIsMissing() {
        Map<String, BigDecimal> rates = Map.of(
                "mcx_silver", new BigDecimal("225.88")
        );

        MetalsDevDataProvider.MetalsDevApiResponse response = new MetalsDevDataProvider.MetalsDevApiResponse(
                "success", "mcx", "INR", "g", "2026-10-04T05:50:04Z", rates
        );

        assertThatThrownBy(() -> MetalsDevDataProvider.normalize(response, properties, Instant.now()))
                .isInstanceOf(MetalsProviderException.class)
                .hasMessageContaining("Missing or non-positive rate for mcx_gold");
    }

    @Test
    @DisplayName("Should throw MetalsProviderException when API key is missing")
    void shouldFailWhenApiKeyIsMissing() {
        properties.setApiKey("");
        MetalsDevDataProvider provider = new MetalsDevDataProvider(properties);

        assertThatThrownBy(provider::fetchLatestRates)
                .isInstanceOf(MetalsProviderException.class)
                .hasMessageContaining("Metals provider API key is not configured");
    }

    @Test
    @DisplayName("Should handle HTTP request successfully via RestClient")
    void shouldFetchRatesSuccessfullyOverHttp() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(builder).build();

        MetalsDevDataProvider provider = new MetalsDevDataProvider(properties, builder.build());

        String jsonResponseBody = """
                {
                  "status": "success",
                  "authority": "mcx",
                  "currency": "INR",
                  "unit": "g",
                  "timestamp": "2026-10-04T05:50:04.579Z",
                  "rates": {
                    "mcx_gold": 15039.0001,
                    "mcx_silver": 225.8769
                  }
                }
                """;

        mockServer.expect(requestTo("https://api.metals.dev/v1/metal/authority?api_key=test-metals-dev-key&authority=mcx&currency=INR&unit=g"))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header("Accept", MediaType.APPLICATION_JSON_VALUE))
                .andRespond(withSuccess(jsonResponseBody, MediaType.APPLICATION_JSON));

        MetalsMarketResponseDto dto = provider.fetchLatestRates();
        assertThat(dto).isNotNull();
        assertThat(dto.metals()).hasSize(2);
        assertThat(dto.metals().getFirst().displayName()).isEqualTo("Gold (MCX)");

        mockServer.verify();
    }

    @Test
    @DisplayName("Should handle HTTP server error gracefully")
    void shouldHandleHttpServerError() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(builder).build();

        MetalsDevDataProvider provider = new MetalsDevDataProvider(properties, builder.build());

        mockServer.expect(requestTo("https://api.metals.dev/v1/metal/authority?api_key=test-metals-dev-key&authority=mcx&currency=INR&unit=g"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withServerError());

        assertThatThrownBy(provider::fetchLatestRates)
                .isInstanceOf(MetalsProviderException.class)
                .hasMessageContaining("Upstream market data provider call failed");

        mockServer.verify();
    }

    @Test
    @DisplayName("Should handle malformed JSON response gracefully")
    void shouldHandleMalformedJson() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(builder).build();

        MetalsDevDataProvider provider = new MetalsDevDataProvider(properties, builder.build());

        mockServer.expect(requestTo("https://api.metals.dev/v1/metal/authority?api_key=test-metals-dev-key&authority=mcx&currency=INR&unit=g"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{ malformed_json ", MediaType.APPLICATION_JSON));

        assertThatThrownBy(provider::fetchLatestRates)
                .isInstanceOf(MetalsProviderException.class);

        mockServer.verify();
    }
}
