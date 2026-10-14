package com.infinance.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;

/**
 * Typed configuration properties for CORS allowed origins.
 *
 * Bound from:
 *   app.cors.allowed-origins  (list of strings in YAML / comma-separated via env)
 *
 * Environment variable override (Spring Boot relaxed binding):
 *   APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,https://example.com
 */
@ConfigurationProperties(prefix = "app.cors")
@Validated
public class CorsProperties {

    /**
     * Origins that are allowed to make cross-origin requests.
     * Defaults to common local development ports; override in profile YAMLs or
     * via the APP_CORS_ALLOWED_ORIGINS environment variable.
     */
    private List<String> allowedOrigins = new ArrayList<>(List.of(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://127.0.0.1:5175"
    ));

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }
}
