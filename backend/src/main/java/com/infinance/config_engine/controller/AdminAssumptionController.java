package com.infinance.config_engine.controller;

import com.infinance.config_engine.dto.AssumptionUpsertRequest;
import com.infinance.config_engine.dto.TaxSlabUpsertRequest;
import com.infinance.config_engine.service.AdminAssumptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin reference data", description = "Role-protected CRUD for financial assumptions, tax slabs, and audit-backed reference data")
public class AdminAssumptionController {
    private final AdminAssumptionService service;
    public AdminAssumptionController(AdminAssumptionService service) { this.service = service; }

    @GetMapping("/assumptions")
    @Operation(summary = "List configurable assumptions")
    public ResponseEntity<?> assumptions(@RequestParam(required = false) String financialYear) {
        return ResponseEntity.ok(service.listAssumptions(financialYear));
    }

    @PutMapping("/assumptions/{id}")
    @Operation(summary = "Create or update a configurable assumption")
    public ResponseEntity<?> upsertAssumption(@PathVariable String id, @Valid @RequestBody AssumptionUpsertRequest request, Authentication auth) {
        return ResponseEntity.ok(service.upsertAssumption(id, request, auth.getName()));
    }

    @PostMapping("/assumptions")
    @Operation(summary = "Create a configurable assumption")
    public ResponseEntity<?> createAssumption(@Valid @RequestBody AssumptionUpsertRequest request, Authentication auth) {
        return ResponseEntity.ok(service.upsertAssumption(null, request, auth.getName()));
    }

    @DeleteMapping("/assumptions/{id}")
    @Operation(summary = "Delete a configurable assumption")
    public ResponseEntity<Void> deleteAssumption(@PathVariable String id, Authentication auth) {
        service.deleteAssumption(id, auth.getName()); return ResponseEntity.noContent().build();
    }

    @GetMapping("/tax-slabs")
    @Operation(summary = "List tax slabs")
    public ResponseEntity<?> slabs(@RequestParam(required = false) String financialYear) {
        return ResponseEntity.ok(service.listSlabs(financialYear));
    }

    @PutMapping("/tax-slabs/{id}")
    @Operation(summary = "Create or update a tax slab")
    public ResponseEntity<?> upsertSlab(@PathVariable(required = false) Long id, @Valid @RequestBody TaxSlabUpsertRequest request, Authentication auth) {
        return ResponseEntity.ok(service.upsertSlab(id, request, auth.getName()));
    }

    @PostMapping("/tax-slabs")
    @Operation(summary = "Create a tax slab")
    public ResponseEntity<?> createSlab(@Valid @RequestBody TaxSlabUpsertRequest request, Authentication auth) {
        return ResponseEntity.ok(service.upsertSlab(null, request, auth.getName()));
    }

    @DeleteMapping("/tax-slabs/{id}")
    @Operation(summary = "Delete a tax slab")
    public ResponseEntity<Void> deleteSlab(@PathVariable Long id, Authentication auth) {
        service.deleteSlab(id, auth.getName()); return ResponseEntity.noContent().build();
    }
}
