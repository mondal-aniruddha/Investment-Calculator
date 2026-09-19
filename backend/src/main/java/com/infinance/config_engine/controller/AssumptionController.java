package com.infinance.config_engine.controller;

import com.infinance.config_engine.service.AssumptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/config")
@Tag(name = "Configuration & Assumptions", description = "Endpoints for fetching financial assumptions, benchmarks, and scheme rates")
public class AssumptionController {

    private final AssumptionService assumptionService;

    public AssumptionController(AssumptionService assumptionService) {
        this.assumptionService = assumptionService;
    }

    @GetMapping("/assumptions")
    @Operation(summary = "Get baseline financial assumptions",
               description = "Returns active rates (PPF, SSY, EPF, NPS), market benchmarks (Nifty CAGR, debt return), and inflation metrics.")
    public ResponseEntity<Map<String, Object>> getAssumptions(
            @RequestParam(required = false) String financialYear) {
        return ResponseEntity.ok(assumptionService.getAllAssumptions(financialYear));
    }
}
