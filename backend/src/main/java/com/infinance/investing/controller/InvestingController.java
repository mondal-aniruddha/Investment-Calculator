package com.infinance.investing.controller;

import com.infinance.investing.dto.LumpsumRequestDto;
import com.infinance.investing.dto.LumpsumResponse;
import com.infinance.investing.dto.SipRequestDto;
import com.infinance.investing.dto.SipResponse;
import com.infinance.investing.service.InvestingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinance.common.config.ApiConstants;

@RestController
@RequestMapping(ApiConstants.INVESTING)
@Tag(name = "Start Investing (SIP & Compounding)", description = "APIs for Systematic Investment Plans (SIP), Step-up SIP, and Lumpsum compounding calculations")
public class InvestingController {

    private final InvestingService investingService;

    public InvestingController(InvestingService investingService) {
        this.investingService = investingService;
    }

    @PostMapping("/sip")
    @Operation(summary = "Calculate SIP growth and wealth creation",
               description = "Computes future value of monthly SIP, step-up projection, pessimistic/expected/optimistic scenarios, and risk-adjusted asset allocation.")
    public ResponseEntity<SipResponse> calculateSip(@Valid @RequestBody SipRequestDto request) {
        return ResponseEntity.ok(investingService.calculateSip(request));
    }

    @PostMapping("/lumpsum")
    @Operation(summary = "Calculate one-time lumpsum investment growth",
               description = "Computes compounded future value and year-by-year progression for one-time lumpsum investments.")
    public ResponseEntity<LumpsumResponse> calculateLumpsum(
            @Valid @RequestBody LumpsumRequestDto.Request request) {
        return ResponseEntity.ok(investingService.calculateLumpsum(request));
    }
}
