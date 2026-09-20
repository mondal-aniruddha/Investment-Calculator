package com.infinance.simulation.controller;
import com.infinance.simulation.dto.*;
import com.infinance.simulation.service.MonteCarloService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/simulations") @Tag(name="Monte Carlo Planning")
public class MonteCarloController {
    private final MonteCarloService service;
    public MonteCarloController(MonteCarloService service) { this.service = service; }
    @PostMapping("/monte-carlo") @Operation(summary="Run a deterministic-seedable Monte Carlo projection")
    public MonteCarloResponse calculate(@Valid @RequestBody MonteCarloRequest request) { return service.calculate(request); }
}
