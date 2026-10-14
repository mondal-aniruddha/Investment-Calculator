package com.infinance.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS configuration for all /api/** endpoints.
 *
 * Allowed origins are injected via {@link CorsProperties} (bound from
 * app.cors.allowed-origins).  The default set (local Vite dev ports) lives in
 * CorsProperties; profile overrides live in application-dev.yml /
 * application-prod.yml; production overrides come from the
 * APP_CORS_ALLOWED_ORIGINS environment variable.
 *
 * Phase 6: migrated from raw @Value injection to typed @ConfigurationProperties.
 */
@Configuration
public class WebCorsConfig implements WebMvcConfigurer {

    private final CorsProperties corsProperties;

    public WebCorsConfig(CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(corsProperties.getAllowedOrigins().toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
