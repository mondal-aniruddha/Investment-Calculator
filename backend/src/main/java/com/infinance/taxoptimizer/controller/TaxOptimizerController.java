package com.infinance.taxoptimizer.controller;
import com.infinance.taxoptimizer.dto.*;
import com.infinance.taxoptimizer.service.TaxOptimizerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/tax/optimizer") @Tag(name="Tax-Saving Optimizer")
public class TaxOptimizerController {
    private final TaxOptimizerService service;
    public TaxOptimizerController(TaxOptimizerService service) { this.service = service; }
    @PostMapping @Operation(summary="Recommend remaining configured tax deductions")
    public TaxOptimizerResponse calculate(@Valid @RequestBody TaxOptimizerRequest request) { return service.calculate(request); }
}
