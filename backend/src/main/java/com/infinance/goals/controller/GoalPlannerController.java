package com.infinance.goals.controller;

import com.infinance.common.config.ApiConstants;
import com.infinance.goals.dto.*;
import com.infinance.goals.service.GoalPlannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.GOALS)
@Tag(name = "Multi-Goal Planner")
public class GoalPlannerController {
    private final GoalPlannerService service;

    public GoalPlannerController(GoalPlannerService service) {
        this.service = service;
    }

    @PostMapping("/plan")
    @Operation(summary = "Plan contributions across multiple goals")
    public GoalPlanResponse plan(@Valid @RequestBody GoalPlanRequest request) {
        return service.calculate(request);
    }
}
