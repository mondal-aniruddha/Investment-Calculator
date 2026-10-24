package com.infinance.queries.controller;

import com.infinance.common.config.ApiConstants;
import com.infinance.queries.dto.QueryDetailDto;
import com.infinance.queries.dto.UpdateQueryStatusRequest;
import com.infinance.queries.entity.QueryCategory;
import com.infinance.queries.entity.QueryStatus;
import com.infinance.queries.service.FinanceQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.ADMIN + "/queries")
@Tag(name = "Admin - Finance Queries", description = "Administrative query management")
@SecurityRequirement(name = "basicAuth")
public class AdminFinanceQueryController {

    private final FinanceQueryService service;

    public AdminFinanceQueryController(FinanceQueryService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List visitor queries (Admin only)",
            description = "Returns paginated list of queries with optional status and category filters.")
    public ResponseEntity<Page<QueryDetailDto>> listQueries(
            @RequestParam(required = false) QueryStatus status,
            @RequestParam(required = false) QueryCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = "desc".equalsIgnoreCase(direction) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sort);
        return ResponseEntity.ok(service.getQueries(status, category, pageable));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update query status (Admin only)",
            description = "Updates the status of a query to NEW, IN_PROGRESS, or RESOLVED.")
    public ResponseEntity<QueryDetailDto> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateQueryStatusRequest request) {
        return ResponseEntity.ok(service.updateStatus(id, request));
    }
}
