package com.infinance.fixedincome.controller;

import com.infinance.fixedincome.dto.*;
import com.infinance.fixedincome.service.FixedIncomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.infinance.common.config.ApiConstants;

@RestController
@RequestMapping(ApiConstants.FIXED_INCOME)
@Tag(name = "Fixed-Income Calculators", description = "Configuration-driven FD, RD, PPF, EPF, NPS, Sukanya, and post-office projections")
public class FixedIncomeController {
    private final FixedIncomeService service;
    public FixedIncomeController(FixedIncomeService service) { this.service = service; }
    @PostMapping("/calculate")
    @Operation(summary = "Calculate a fixed-income scheme projection")
    public ResponseEntity<FixedIncomeResponse> calculate(@Valid @RequestBody FixedIncomeRequest request) {
        return ResponseEntity.ok(service.calculate(request));
    }
}
