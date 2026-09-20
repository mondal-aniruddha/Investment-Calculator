package com.infinance.healthscore.controller;
import com.infinance.healthscore.dto.*;
import com.infinance.healthscore.service.FinancialHealthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/health-score") @Tag(name="Financial Health Score")
public class FinancialHealthController {
    private final FinancialHealthService service;
    public FinancialHealthController(FinancialHealthService service) { this.service = service; }
    @PostMapping("/calculate") @Operation(summary="Calculate a weighted financial health score")
    public HealthScoreResponse calculate(@Valid @RequestBody HealthScoreRequest request) { return service.calculate(request); }
}
