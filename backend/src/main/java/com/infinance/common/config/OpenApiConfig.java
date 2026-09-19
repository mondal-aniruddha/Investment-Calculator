package com.infinance.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
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
}
