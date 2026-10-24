package com.infinance.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 3.0 / Swagger configuration.
 *
 * Configures the API metadata, JWT security scheme, and grouped endpoints
 * categorized by functional domain.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components().addSecuritySchemes("bearerAuth",
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
                .info(new Info()
                        .title("Interactive Investment & Personal Finance Calculator for India API")
                        .version("1.0.0")
                        .description("Production-quality REST APIs for Indian personal finance: " +
                                "SIP, Income Tax (Old vs New Regime), Retirement Planning, Emergency Funds, " +
                                "Credit Score Improvement, Home Loan Tax Benefits, Debt Payoff, Budgeting, and Inflation Protection.")
                        .contact(new Contact()
                                .name("InFinance Engineering")
                                .email("support@infinance.local"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")));
    }

    @Bean
    public GroupedOpenApi allApis() {
        return GroupedOpenApi.builder()
                .group("1-all")
                .pathsToMatch(ApiConstants.API_V1 + "/**")
                .build();
    }

    @Bean
    public GroupedOpenApi calculatorApis() {
        return GroupedOpenApi.builder()
                .group("2-calculators")
                .pathsToMatch(
                        ApiConstants.INVESTING + "/**",
                        ApiConstants.MUTUAL_FUNDS + "/**",
                        ApiConstants.TAX + "/**",
                        ApiConstants.RETIREMENT + "/**",
                        ApiConstants.LOANS + "/**",
                        ApiConstants.FIXED_INCOME + "/**",
                        ApiConstants.GOALS + "/**",
                        ApiConstants.HEALTH_SCORE + "/**",
                        ApiConstants.NET_WORTH + "/**",
                        ApiConstants.SIMULATIONS + "/**",
                        ApiConstants.ANALYSIS + "/**"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi marketAndContentApis() {
        return GroupedOpenApi.builder()
                .group("3-market-and-content")
                .pathsToMatch(
                        ApiConstants.MARKET + "/**",
                        ApiConstants.LEARN + "/**",
                        ApiConstants.GLOSSARY + "/**",
                        ApiConstants.REPORTS + "/**",
                        ApiConstants.INSIGHTS + "/**"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi authAndScenariosApis() {
        return GroupedOpenApi.builder()
                .group("4-auth-and-scenarios")
                .pathsToMatch(
                        ApiConstants.AUTH + "/**",
                        ApiConstants.SCENARIOS + "/**",
                        ApiConstants.CONFIG + "/**",
                        ApiConstants.ADMIN + "/**",
                        ApiConstants.QUERIES + "/**"
                )
                .build();
    }
}
