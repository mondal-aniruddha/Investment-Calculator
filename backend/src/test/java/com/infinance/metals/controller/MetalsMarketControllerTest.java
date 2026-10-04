package com.infinance.metals.controller;

import com.infinance.metals.dto.CacheStatus;
import com.infinance.metals.dto.MetalPriceDto;
import com.infinance.metals.dto.MetalsMarketResponseDto;
import com.infinance.metals.exception.MetalsServiceUnavailableException;
import com.infinance.metals.service.MetalsMarketService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class MetalsMarketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MetalsMarketService metalsMarketService;

    @Test
    @DisplayName("GET /api/v1/market/metals returns 200 with cache-control header and normalized metal prices")
    void shouldReturnMetalsPricesWithCacheHeaders() throws Exception {
        Instant now = Instant.parse("2026-10-04T12:00:00Z");
        List<MetalPriceDto> metals = List.of(
                new MetalPriceDto("XAU", "XAU", "Gold (MCX)", "MCX Reference (99.5%)",
                        new BigDecimal("15039.00"), new BigDecimal("150390.00"),
                        new BigDecimal("13785.75"), new BigDecimal("137857.50"),
                        now, now, CacheStatus.LIVE, "metals.dev", "Indicative MCX reference price"),
                new MetalPriceDto("XAG", "XAG", "Silver", "MCX Reference",
                        new BigDecimal("225.88"), new BigDecimal("2258.80"), null, null,
                        now, now, CacheStatus.LIVE, "metals.dev", "Indicative MCX reference price")
        );

        MetalsMarketResponseDto responseDto = new MetalsMarketResponseDto(
                metals, now, CacheStatus.LIVE, "metals.dev",
                "Indicative MCX reference prices for financial planning and educational purposes only; not local jewellery retail prices (excludes GST, making charges, margins) and not for trading."
        );

        when(metalsMarketService.getMetalsPrices()).thenReturn(responseDto);

        mockMvc.perform(get("/api/v1/market/metals")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("max-age=60")))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("stale-while-revalidate=240")))
                .andExpect(jsonPath("$.cacheStatus", is("LIVE")))
                .andExpect(jsonPath("$.source", is("metals.dev")))
                .andExpect(jsonPath("$.disclaimer", containsString("Indicative MCX reference prices")))
                .andExpect(jsonPath("$.metals", hasSize(2)))
                .andExpect(jsonPath("$.metals[0].metalCode", is("XAU")))
                .andExpect(jsonPath("$.metals[0].displayName", is("Gold (MCX)")))
                .andExpect(jsonPath("$.metals[0].pricePerGramInr", is(15039.00)))
                .andExpect(jsonPath("$.metals[0].pricePer10GramsInr", is(150390.00)))
                .andExpect(jsonPath("$.metals[0].indicative22kPerGramInr", is(13785.75)))
                .andExpect(jsonPath("$.metals[0].indicative22kPer10GramsInr", is(137857.50)))
                .andExpect(jsonPath("$.metals[1].metalCode", is("XAG")))
                .andExpect(jsonPath("$.metals[1].pricePerGramInr", is(225.88)))
                .andExpect(jsonPath("$.metals[1].pricePer10GramsInr", is(2258.80)));
    }

    @Test
    @DisplayName("GET /api/v1/market/metals returns 503 structured error when provider is unavailable and no cache exists")
    void shouldReturn503WhenMetalsServiceUnavailable() throws Exception {
        when(metalsMarketService.getMetalsPrices())
                .thenThrow(new MetalsServiceUnavailableException("Live metal reference prices are temporarily unavailable. Please try again later."));

        mockMvc.perform(get("/api/v1/market/metals")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status", is(503)))
                .andExpect(jsonPath("$.code", is("METALS_SERVICE_UNAVAILABLE")))
                .andExpect(jsonPath("$.message", containsString("Live metal reference prices are temporarily unavailable")));
    }
}
