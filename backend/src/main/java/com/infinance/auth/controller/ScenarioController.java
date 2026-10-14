package com.infinance.auth.controller;

import com.infinance.auth.dto.*;
import com.infinance.auth.service.ScenarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.infinance.common.config.ApiConstants;

@RestController @RequestMapping(ApiConstants.SCENARIOS) @Tag(name="Saved scenarios")
public class ScenarioController {
    private final ScenarioService service;
    public ScenarioController(ScenarioService service) { this.service=service; }
    @GetMapping @Operation(summary="List saved scenarios for current user") public List<ScenarioResponse> list(Authentication a) { return service.list(a.getName()); }
    @PostMapping @Operation(summary="Save a new scenario") public ScenarioResponse create(Authentication a,@Valid @RequestBody ScenarioRequest r) { return service.create(a.getName(),r); }
    @PutMapping("/{id}") @Operation(summary="Update an existing saved scenario") public ScenarioResponse update(Authentication a,@PathVariable String id,@Valid @RequestBody ScenarioRequest r) { return service.update(a.getName(),id,r); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary="Delete a saved scenario") public void delete(Authentication a,@PathVariable String id) { service.delete(a.getName(),id); }
    @PostMapping("/compare") @Operation(summary="Compare owned scenarios") public CompareResponse compare(Authentication a,@Valid @RequestBody CompareRequest r) { return service.compare(a.getName(),r); }
}
