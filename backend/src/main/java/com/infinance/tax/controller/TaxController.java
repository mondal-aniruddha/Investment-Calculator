package com.infinance.tax.controller;

import com.infinance.tax.dto.TaxCalculationRequestDto;
import com.infinance.tax.dto.TaxCalculationResponseDto;
import com.infinance.tax.dto.TaxSlabDto;
import com.infinance.tax.service.TaxService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tax")
@Tag(name = "Income Tax Calculator & Explainer", description = "Endpoints for Indian Income Tax calculations comparing Old and New regimes (FY 2024-25 & beyond)")
public class TaxController {

    private final TaxService taxService;

    public TaxController(TaxService taxService) {
        this.taxService = taxService;
    }

    @PostMapping("/calculate")
    @Operation(summary = "Calculate and compare Old vs New Tax Regime",
               description = "Computes step-by-step slab breakdown, Section 87A rebate, standard deduction, cess, and recommends the optimal regime.")
    public ResponseEntity<TaxCalculationResponseDto> calculateTax(
            @Valid @RequestBody TaxCalculationRequestDto request) {
        return ResponseEntity.ok(taxService.calculateTax(request));
    }

    @GetMapping("/slabs")
    @Operation(summary = "Get configured tax slabs for a financial year",
               description = "Returns the progressive income tax slabs and rates for both New and Old regimes.")
    public ResponseEntity<Map<String, List<TaxSlabDto>>> getTaxSlabs(
            @RequestParam(required = false) String fy) {
        return ResponseEntity.ok(taxService.getTaxSlabs(fy));
    }
}
