package com.infinance.retirement.controller;

import com.infinance.retirement.dto.RetirementRequestDto;
import com.infinance.retirement.dto.RetirementResponseDto;
import com.infinance.retirement.service.RetirementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/retirement")
@Tag(name = "Retirement Planner", description = "Endpoints for inflation-adjusted retirement corpus forecasting, accumulation trajectories, and safe withdrawal analysis")
public class RetirementController {

    private final RetirementService retirementService;

    public RetirementController(RetirementService retirementService) {
        this.retirementService = retirementService;
    }

    @PostMapping("/plan")
    @Operation(summary = "Calculate retirement corpus requirement and glide-path",
               description = "Computes inflated future monthly expenses, required nest egg corpus, shortfall/surplus from existing savings, additional monthly SIP required, and what-if age scenarios.")
    public ResponseEntity<RetirementResponseDto> calculateRetirementPlan(
            @Valid @RequestBody RetirementRequestDto request) {
        return ResponseEntity.ok(retirementService.calculateRetirementPlan(request));
    }
}
