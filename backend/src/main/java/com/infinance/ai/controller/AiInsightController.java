package com.infinance.ai.controller;

import com.infinance.ai.dto.AiInsightRequest;
import com.infinance.ai.service.AiInsightService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/insights")
@Tag(name = "AI insights", description = "Optional plain-language explanations without personal identifiers")
public class AiInsightController {
    private final AiInsightService service;
    public AiInsightController(AiInsightService service) { this.service = service; }

    @PostMapping("/explain")
    @Operation(summary = "Explain calculator results")
    public ResponseEntity<?> explain(@Valid @RequestBody AiInsightRequest request) {
        return ResponseEntity.ok(service.explain(request));
    }
}
