package com.infinance.metals.controller;

import com.infinance.metals.dto.MetalsMarketResponseDto;
import com.infinance.metals.service.MetalsMarketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/market")
@Tag(name = "Precious Metal Reference Prices", description = "Public market reference prices for Gold, Silver, Platinum, and Palladium in INR/gram")
public class MetalsMarketController {

    private final MetalsMarketService metalsMarketService;

    public MetalsMarketController(MetalsMarketService metalsMarketService) {
        this.metalsMarketService = metalsMarketService;
    }

    @GetMapping("/metals")
    @Operation(summary = "Get live indicative precious metal reference prices",
            description = "Returns indicative spot/reference prices for Gold (24K and indicative 22K), Silver, Platinum, and Palladium in INR per gram with cache status, timestamps, and educational disclaimers.")
    public ResponseEntity<MetalsMarketResponseDto> getMetalsPrices() {
        MetalsMarketResponseDto response = metalsMarketService.getMetalsPrices();
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=60, stale-while-revalidate=240")
                .body(response);
    }
}
