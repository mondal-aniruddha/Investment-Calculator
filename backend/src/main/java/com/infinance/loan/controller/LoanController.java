package com.infinance.loan.controller;

import com.infinance.loan.dto.*;
import com.infinance.loan.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/loans")
@Tag(name = "Loan and EMI Suite", description = "EMI, amortization, prepayment, balance transfer, and rate-change simulations")
public class LoanController {
    private final LoanService service;
    public LoanController(LoanService service) { this.service = service; }
    @PostMapping("/emi")
    @Operation(summary = "Calculate loan EMI and amortization")
    public ResponseEntity<LoanCalculationResponse> emi(@Valid @RequestBody LoanEmiRequest request) { return ResponseEntity.ok(service.emi(request)); }
    @PostMapping("/prepayment")
    @Operation(summary = "Estimate part-payment savings")
    public ResponseEntity<LoanCalculationResponse> prepayment(@Valid @RequestBody LoanPrepaymentRequest request) { return ResponseEntity.ok(service.prepayment(request)); }
    @PostMapping("/surplus-comparison")
    @Operation(summary = "Compare part-payment with investing surplus in a SIP")
    public ResponseEntity<LoanCalculationResponse> compare(@Valid @RequestBody SurplusComparisonRequest request) { return ResponseEntity.ok(service.compare(request)); }
    @PostMapping("/balance-transfer")
    @Operation(summary = "Estimate balance-transfer savings after fees")
    public ResponseEntity<LoanCalculationResponse> transfer(@Valid @RequestBody BalanceTransferRequest request) { return ResponseEntity.ok(service.transfer(request)); }
    @PostMapping("/floating-rate")
    @Operation(summary = "Simulate a floating-rate change")
    public ResponseEntity<LoanCalculationResponse> floating(@Valid @RequestBody FloatingRateRequest request) { return ResponseEntity.ok(service.floating(request)); }
}
