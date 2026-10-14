package com.infinance.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.infinance.auth.security.JwtAuthenticationFilter;
import com.infinance.common.exception.ErrorResponse;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfiguration {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        http.cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        .contentTypeOptions(options -> {})
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; frame-ancestors 'none'"))
                        .frameOptions(options -> options.deny())
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000)))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                ApiConstants.AUTH + "/register",
                                ApiConstants.AUTH + "/login",
                                ApiConstants.MARKET + "/**",
                                ApiConstants.LEARN + "/**",
                                ApiConstants.GLOSSARY + "/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/actuator/health"
                        ).permitAll()
                        .requestMatchers(ApiConstants.ADMIN + "/**").hasRole("ADMIN")
                        .requestMatchers(ApiConstants.CONFIG + "/refresh").hasRole("ADMIN")
                        .requestMatchers(ApiConstants.AUTH + "/**", ApiConstants.SCENARIOS + "/**").hasRole("USER")
                        .anyRequest().permitAll())
                .httpBasic(basic -> {})
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        ObjectMapper mapper = JsonMapper.builder().findAndAddModules().build();
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            String correlationId = request.getHeader("X-Correlation-ID");
            if (correlationId == null) {
                correlationId = org.slf4j.MDC.get("correlationId");
            }
            ErrorResponse error = ErrorResponse.of(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "UNAUTHORIZED",
                    "Full authentication is required to access this resource",
                    List.of(),
                    correlationId
            );
            mapper.writeValue(response.getOutputStream(), error);
        };
    }

    @Bean
    public org.springframework.security.web.access.AccessDeniedHandler accessDeniedHandler() {
        ObjectMapper mapper = JsonMapper.builder().findAndAddModules().build();
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            String correlationId = request.getHeader("X-Correlation-ID");
            if (correlationId == null) {
                correlationId = org.slf4j.MDC.get("correlationId");
            }
            ErrorResponse error = ErrorResponse.of(
                    HttpServletResponse.SC_FORBIDDEN,
                    "FORBIDDEN",
                    "Access is denied to this resource",
                    List.of(),
                    correlationId
            );
            mapper.writeValue(response.getOutputStream(), error);
        };
    }

    @Bean
    UserDetailsService userDetailsService(AdminSecurityProperties config, PasswordEncoder encoder) {
        return new InMemoryUserDetailsManager(User.withUsername(config.getUsername())
                .password(encoder.encode(config.getPassword()))
                .roles("ADMIN")
                .build());
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}
