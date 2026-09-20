package com.infinance.mutualfund.controller;

import com.infinance.mutualfund.dto.*;
import com.infinance.mutualfund.service.MutualFundService;
import com.infinance.investing.dto.LumpsumRequestDto;
import com.infinance.investing.dto.SipRequestDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/mutual-funds")
@Tag(name = "Mutual Fund Tools", description = "SIP, step-up SIP, lumpsum, SWP, CAGR, and XIRR calculators")
public class MutualFundController {
    private final MutualFundService service;
    public MutualFundController(MutualFundService service) { this.service = service; }
    @PostMapping("/sip")
    @Operation(summary = "Calculate mutual-fund SIP or step-up SIP")
    public ResponseEntity<MutualFundResponse> sip(@Valid @RequestBody SipRequestDto request) {
        BigDecimal annualReturn = request.getExpectedAnnualReturn() != null
                ? request.getExpectedAnnualReturn() : BigDecimal.ZERO;
        return ResponseEntity.ok(service.sip(request.getMonthlyInvestment(), request.getInvestmentHorizonYears(),
                annualReturn, request.getAnnualStepUpPercent() == null ? BigDecimal.ZERO : request.getAnnualStepUpPercent()));
    }
    @PostMapping("/lumpsum")
    @Operation(summary = "Calculate mutual-fund lumpsum growth")
    public ResponseEntity<MutualFundResponse> lumpsum(@Valid @RequestBody LumpsumRequestDto.Request request) {
        BigDecimal annualReturn = request.getExpectedAnnualReturn() != null
                ? request.getExpectedAnnualReturn() : BigDecimal.ZERO;
        return ResponseEntity.ok(service.lumpsum(request.getTotalInvestment(), request.getInvestmentHorizonYears(), annualReturn));
    }
    @PostMapping("/swp")
    @Operation(summary = "Calculate systematic withdrawal plan sustainability")
    public ResponseEntity<MutualFundResponse> swp(@Valid @RequestBody SwpRequest request) { return ResponseEntity.ok(service.swp(request)); }
    @PostMapping("/cagr")
    @Operation(summary = "Calculate CAGR")
    public ResponseEntity<BigDecimal> cagr(@Valid @RequestBody CagrRequest request) { return ResponseEntity.ok(service.cagr(request)); }
    @PostMapping("/xirr")
    @Operation(summary = "Calculate XIRR for dated cash flows")
    public ResponseEntity<BigDecimal> xirr(@Valid @RequestBody XirrRequest request) { return ResponseEntity.ok(service.xirr(request)); }
}
