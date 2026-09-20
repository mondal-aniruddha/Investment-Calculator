package com.infinance.networth.controller;
import com.infinance.networth.dto.*;
import com.infinance.networth.service.NetWorthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/net-worth") @Tag(name="Net Worth Tracker")
public class NetWorthController {
    private final NetWorthService service;
    public NetWorthController(NetWorthService service) { this.service = service; }
    @PostMapping("/calculate") @Operation(summary="Aggregate assets, liabilities, allocation, and history")
    public NetWorthResponse calculate(@Valid @RequestBody NetWorthRequest request) { return service.calculate(request); }
}
