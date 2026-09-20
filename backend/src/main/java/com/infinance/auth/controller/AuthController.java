package com.infinance.auth.controller;

import com.infinance.auth.dto.AuthDtos.*;
import com.infinance.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/auth") @Tag(name="Authentication")
public class AuthController {
    private final AuthService service;
    public AuthController(AuthService service) { this.service=service; }
    @PostMapping("/register") @Operation(summary="Create an account") public AuthResponse register(@Valid @RequestBody RegisterRequest r) { return service.register(r); }
    @PostMapping("/login") @Operation(summary="Issue a JWT") public AuthResponse login(@Valid @RequestBody LoginRequest r) { return service.login(r); }
    @GetMapping("/profile") @Operation(summary="Get current profile") public ProfileResponse profile(Authentication a) { return service.profile(a.getName()); }
    @PutMapping("/profile") public ProfileResponse update(Authentication a,@Valid @RequestBody ProfileUpdateRequest r) { return service.update(a.getName(),r); }
    @DeleteMapping("/account") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary="Delete account and all saved data") public void delete(Authentication a) { service.delete(a.getName()); }
}
