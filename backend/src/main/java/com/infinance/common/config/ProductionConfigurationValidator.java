package com.infinance.common.config;

import com.infinance.auth.config.JwtProperties;
import com.infinance.auth.config.OtpProperties;
import com.infinance.common.security.EncryptionProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Production environment startup validator.
 *
 * Fails fast during application startup in the "prod" profile if:
 * 1. The JWT secret is missing, blank, shorter than 32 characters, or equal to the known development default.
 * 2. The encryption secret is missing, blank, or equal to the known development default.
 * 3. The database connection URL or credentials are missing or set to local defaults.
 * 4. The OTP provider is set to "dev", Twilio credentials are missing, or OTP HMAC secret is insecure/short.
 */
@Component
@Profile("prod")
public class ProductionConfigurationValidator {

    public static final String DEV_JWT_DEFAULT = "change-this-development-secret-key-at-least-32-bytes";
    public static final String DEV_ENCRYPTION_DEFAULT_1 = "development-only-encryption-secret";
    public static final String DEV_ENCRYPTION_DEFAULT_2 = "development-only-change-me";

    private final JwtProperties jwtProperties;
    private final EncryptionProperties encryptionProperties;
    private final OtpProperties otpProperties;
    private final Environment environment;

    public ProductionConfigurationValidator(
            JwtProperties jwtProperties,
            EncryptionProperties encryptionProperties,
            OtpProperties otpProperties,
            Environment environment
    ) {
        this.jwtProperties = jwtProperties;
        this.encryptionProperties = encryptionProperties;
        this.otpProperties = otpProperties;
        this.environment = environment;
    }

    @PostConstruct
    public void validate() {
        validateJwtSecret();
        validateEncryptionSecret();
        validateDatabaseCredentials();
        validateOtpConfiguration();
    }

    public void validateJwtSecret() {
        String secret = jwtProperties.getSecret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Production startup failed: JWT secret (infinance.jwt.secret) must not be empty");
        }
        if (DEV_JWT_DEFAULT.equalsIgnoreCase(secret.trim())) {
            throw new IllegalStateException("Production startup failed: Insecure development JWT secret detected in production profile");
        }
        if (secret.length() < 32) {
            throw new IllegalStateException("Production startup failed: JWT secret must be at least 32 characters for HMAC-SHA algorithms");
        }
    }

    public void validateEncryptionSecret() {
        String secret = encryptionProperties.getSecret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Production startup failed: Encryption secret must not be empty");
        }
        if (DEV_ENCRYPTION_DEFAULT_1.equalsIgnoreCase(secret.trim()) || DEV_ENCRYPTION_DEFAULT_2.equalsIgnoreCase(secret.trim())) {
            throw new IllegalStateException("Production startup failed: Insecure development encryption secret detected in production profile");
        }
    }

    public void validateDatabaseCredentials() {
        String url = environment.getProperty("spring.datasource.url");
        String username = environment.getProperty("spring.datasource.username");
        String password = environment.getProperty("spring.datasource.password");

        if (url == null || url.isBlank() || url.contains(":mem:") || url.contains("h2")) {
            throw new IllegalStateException("Production startup failed: Production database URL (spring.datasource.url) is missing or set to in-memory H2");
        }
        if (username == null || username.isBlank() || "sa".equalsIgnoreCase(username.trim())) {
            throw new IllegalStateException("Production startup failed: Insecure or missing database username for production");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalStateException("Production startup failed: Database password is required for production");
        }
    }

    public void validateOtpConfiguration() {
        String provider = otpProperties.getProvider();
        if ("dev".equalsIgnoreCase(provider)) {
            throw new IllegalStateException("Production startup failed: Insecure development OTP provider ('dev') cannot be used in production profile");
        }

        String secret = otpProperties.getSecret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Production startup failed: OTP secret (infinance.otp.secret) must not be empty");
        }
        if (OtpProperties.DEV_SECRET_DEFAULT.equalsIgnoreCase(secret.trim())) {
            throw new IllegalStateException("Production startup failed: Insecure development OTP secret detected in production profile");
        }
        if (secret.length() < 32) {
            throw new IllegalStateException("Production startup failed: OTP secret must be at least 32 characters for HMAC-SHA algorithms");
        }

        if ("twilio".equalsIgnoreCase(provider)) {
            OtpProperties.TwilioProperties twilio = otpProperties.getTwilio();
            if (twilio == null ||
                    twilio.getAccountSid() == null || twilio.getAccountSid().isBlank() ||
                    twilio.getAuthToken() == null || twilio.getAuthToken().isBlank() ||
                    twilio.getSmsFrom() == null || twilio.getSmsFrom().isBlank() ||
                    twilio.getWhatsappFrom() == null || twilio.getWhatsappFrom().isBlank()) {
                throw new IllegalStateException("Production startup failed: Twilio credentials and senders (accountSid, authToken, smsFrom, whatsappFrom) must be configured for OTP delivery in production");
            }
        }
    }
}
