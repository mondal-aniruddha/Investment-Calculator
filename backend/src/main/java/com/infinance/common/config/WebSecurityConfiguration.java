package com.infinance.common.config;

import com.infinance.auth.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import java.time.Duration;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfiguration {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        .contentTypeOptions(options -> {})
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; frame-ancestors 'none'"))
                        .frameOptions(options -> options.deny())
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000)))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/market/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/actuator/health").permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/config/refresh").hasRole("ADMIN")
                        .requestMatchers("/api/v1/auth/**", "/api/v1/scenarios/**").hasRole("USER")
                        .anyRequest().permitAll())
                .httpBasic(basic -> {})
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public org.springframework.security.web.AuthenticationEntryPoint authenticationEntryPoint() {
        com.fasterxml.jackson.databind.ObjectMapper mapper = com.fasterxml.jackson.databind.json.JsonMapper.builder().findAndAddModules().build();
        return (request, response, authException) -> {
            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(org.springframework.http.MediaType.APPLICATION_JSON_VALUE);
            com.infinance.common.exception.ErrorResponse error = com.infinance.common.exception.ErrorResponse.of(
                    jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED,
                    "UNAUTHORIZED",
                    "Full authentication is required to access this resource"
            );
            mapper.writeValue(response.getOutputStream(), error);
        };
    }

    @Bean
    UserDetailsService userDetailsService(SecurityConfig config, PasswordEncoder encoder) {
        return new InMemoryUserDetailsManager(User.withUsername(config.getUsername())
                .password(encoder.encode(config.getPassword()))
                .roles("ADMIN")
                .build());
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("assumptions", "tax-slabs", "ai-insights");
        manager.setCaffeine(com.github.benmanes.caffeine.cache.Caffeine.newBuilder()
                .maximumSize(500).expireAfterWrite(Duration.ofMinutes(15)));
        return manager;
    }
}
