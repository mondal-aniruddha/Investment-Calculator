package com.infinance.sensitivity.controller;
import com.infinance.sensitivity.dto.*;
import com.infinance.sensitivity.service.SensitivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/analysis") @Tag(name="Sensitivity and What-If Analysis")
public class SensitivityController {
    private final SensitivityService service;
    public SensitivityController(SensitivityService service) { this.service = service; }
    @PostMapping("/sensitivity") @Operation(summary="Compare return and contribution what-if scenarios")
    public SensitivityResponse calculate(@Valid @RequestBody SensitivityRequest request) { return service.calculate(request); }
}
