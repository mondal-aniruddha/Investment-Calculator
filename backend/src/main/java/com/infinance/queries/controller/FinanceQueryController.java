package com.infinance.queries.controller;

import com.infinance.common.config.ApiConstants;
import com.infinance.queries.dto.CreateQueryRequest;
import com.infinance.queries.dto.QuerySubmissionResponse;
import com.infinance.queries.service.FinanceQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.QUERIES)
@Tag(name = "Finance Queries", description = "Public personal finance queries and consultation requests")
public class FinanceQueryController {

    private final FinanceQueryService service;

    public FinanceQueryController(FinanceQueryService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Submit a personal finance query",
            description = "Public endpoint for visitors to submit a query regarding investments, tax, retirement, or loans. Rate-limited per IP.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Query successfully created"),
            @ApiResponse(responseCode = "400", description = "Invalid request fields or bot honeypot triggered"),
            @ApiResponse(responseCode = "429", description = "Rate limit exceeded for this IP")
    })
    public ResponseEntity<QuerySubmissionResponse> submitQuery(
            @Valid @RequestBody CreateQueryRequest request,
            HttpServletRequest httpServletRequest) {
        String clientIp = resolveClientIp(httpServletRequest);
        QuerySubmissionResponse response = service.submitQuery(request, clientIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }
}
