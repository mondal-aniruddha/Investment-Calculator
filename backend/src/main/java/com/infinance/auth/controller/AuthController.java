package com.infinance.auth.controller;

import com.infinance.auth.dto.*;
import com.infinance.auth.service.AuthService;
import com.infinance.common.config.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.AUTH)
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    @Operation(summary = "Initiate account registration with phone verification OTP")
    public AuthResponse register(@Valid @RequestBody RegisterRequest r) {
        return service.register(r);
    }

    @PostMapping("/register/verify")
    @Operation(summary = "Verify registration OTP and activate account")
    public AuthResponse verifyRegistration(@Valid @RequestBody OtpVerifyRequest r) {
        return service.verifyRegistration(r);
    }

    @PostMapping("/otp/resend")
    @Operation(summary = "Resend verification OTP subject to cooldown and rate limits")
    public AuthResponse resendOtp(@Valid @RequestBody OtpResendRequest r) {
        return service.resendOtp(r);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate credentials and issue JWT (or initiate 2FA OTP)")
    public AuthResponse login(@Valid @RequestBody LoginRequest r) {
        return service.login(r);
    }

    @PostMapping("/2fa/verify")
    @Operation(summary = "Verify two-factor OTP or backup code to complete login")
    public AuthResponse verifyTwoFactor(@Valid @RequestBody TwoFactorVerifyRequest r) {
        return service.verifyTwoFactor(r);
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current authenticated profile")
    public ProfileResponse profile(Authentication a) {
        return service.profile(a.getName());
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated profile (alias)")
    public ProfileResponse me(Authentication a) {
        return service.profile(a.getName());
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile display name")
    public ProfileResponse update(Authentication a, @Valid @RequestBody ProfileUpdateRequest r) {
        return service.update(a.getName(), r);
    }

    @DeleteMapping("/account")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete account and all associated data")
    public void delete(Authentication a) {
        service.delete(a.getName());
    }

    @GetMapping("/2fa/status")
    @Operation(summary = "Get two-factor authentication and phone verification status")
    public TwoFactorStatusResponse getTwoFactorStatus(Authentication a) {
        return service.getTwoFactorStatus(a.getName());
    }

    @PostMapping("/2fa/enable")
    @Operation(summary = "Initiate two-factor enablement OTP challenge")
    public AuthResponse startEnableTwoFactor(Authentication a, @RequestParam(defaultValue = "SMS") String channel) {
        return service.startEnableTwoFactor(a.getName(), channel);
    }

    @PostMapping("/2fa/enable/verify")
    @Operation(summary = "Verify OTP and finalize two-factor enablement, returning backup codes")
    public BackupCodesResponse completeEnableTwoFactor(Authentication a, @Valid @RequestBody OtpVerifyRequest r) {
        return service.completeEnableTwoFactor(a.getName(), r);
    }

    @PostMapping("/2fa/disable")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Disable two-factor authentication with password and optional OTP")
    public void disableTwoFactor(
            Authentication a,
            @Valid @RequestBody PasswordConfirmRequest r,
            @RequestParam(required = false) String challengeId
    ) {
        service.disableTwoFactor(a.getName(), r, challengeId);
    }

    @PostMapping("/2fa/backup-codes/regenerate")
    @Operation(summary = "Regenerate two-factor backup codes")
    public BackupCodesResponse regenerateBackupCodes(
            Authentication a,
            @Valid @RequestBody PasswordConfirmRequest r,
            @RequestParam(required = false) String challengeId
    ) {
        return service.regenerateBackupCodes(a.getName(), r, challengeId);
    }

    @PostMapping("/phone/change")
    @Operation(summary = "Request phone number change OTP")
    public AuthResponse changePhone(Authentication a, @Valid @RequestBody PhoneChangeRequest r) {
        return service.changePhone(a.getName(), r);
    }

    @PostMapping("/phone/change/verify")
    @Operation(summary = "Verify OTP and finalize phone number change")
    public ProfileResponse verifyChangePhone(Authentication a, @Valid @RequestBody PhoneChangeVerifyRequest r) {
        return service.verifyChangePhone(a.getName(), r);
    }
}
