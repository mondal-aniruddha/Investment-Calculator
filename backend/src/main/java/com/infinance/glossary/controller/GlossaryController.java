package com.infinance.glossary.controller;

import com.infinance.glossary.dto.GlossaryTermDto;
import com.infinance.glossary.service.GlossaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.infinance.common.config.ApiConstants;

@RestController
@RequestMapping(ApiConstants.GLOSSARY)
@Tag(name = "Financial Glossary", description = "Endpoints for financial terms dictionary and inline tooltips (CAGR, XIRR, Expense Ratio, etc.)")
public class GlossaryController {

    private final GlossaryService service;

    public GlossaryController(GlossaryService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Get all glossary terms", description = "Returns full dictionary of financial terms with short definitions and explainers.")
    public ResponseEntity<List<GlossaryTermDto>> getAllTerms() {
        return ResponseEntity.ok(service.getAllTerms());
    }

    @GetMapping("/{term}")
    @Operation(summary = "Get term definition", description = "Fetch definition for a single term by keyword.")
    public ResponseEntity<GlossaryTermDto> getTerm(
            @Parameter(description = "Financial term name, e.g. CAGR, XIRR, 80C") @PathVariable String term) {
        return ResponseEntity.ok(service.getTerm(term));
    }
}
