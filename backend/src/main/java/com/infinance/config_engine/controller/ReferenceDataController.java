package com.infinance.config_engine.controller;

import com.infinance.config_engine.service.ReferenceDataRefreshService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/config")
@Tag(name = "Reference data refresh", description = "Status of scheduled reference-data refresh jobs")
public class ReferenceDataController {
    private final ReferenceDataRefreshService service;
    public ReferenceDataController(ReferenceDataRefreshService service) { this.service = service; }

    @GetMapping("/refresh-status")
    @Operation(summary = "Get reference-data refresh status and last-known timestamps")
    public ResponseEntity<?> status() { return ResponseEntity.ok(service.getStatus()); }

    @PostMapping("/refresh")
    @Operation(summary = "Trigger a reference-data refresh")
    public ResponseEntity<?> refresh() { service.refresh(); return ResponseEntity.ok(service.getStatus()); }
}
