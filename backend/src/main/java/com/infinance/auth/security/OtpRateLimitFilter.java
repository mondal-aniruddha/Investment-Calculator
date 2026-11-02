package com.infinance.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.infinance.auth.config.OtpProperties;
import com.infinance.common.exception.ErrorResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OtpRateLimitFilter extends OncePerRequestFilter {

    private static final Set<String> RATE_LIMITED_PATHS = Set.of(
            "/api/v1/auth/register",
            "/api/v1/auth/register/verify",
            "/api/v1/auth/otp/resend",
            "/api/v1/auth/2fa/verify"
    );

    private final OtpProperties otpProperties;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = JsonMapper.builder().findAndAddModules().build();

    public OtpRateLimitFilter(OtpProperties otpProperties) {
        this.otpProperties = otpProperties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        if ("POST".equalsIgnoreCase(request.getMethod()) && RATE_LIMITED_PATHS.contains(path)) {
            String clientIp = getClientIp(request);
            int hourlyLimit = Math.max(10, otpProperties.getMaxSendsPerIpHour());

            Bucket bucket = buckets.computeIfAbsent(clientIp, ignored -> Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(hourlyLimit)
                            .refillIntervally(hourlyLimit, Duration.ofHours(1)).build())
                    .build());

            if (!bucket.tryConsume(1)) {
                response.setStatus(429);
                response.setHeader("Retry-After", "3600");
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                ErrorResponse error = ErrorResponse.of(429, "RATE_LIMIT_EXCEEDED",
                        "Too many verification requests from this IP. Please try again later.");
                mapper.writeValue(response.getOutputStream(), error);
                return;
            }
        }
        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }

    public void reset() {
        buckets.clear();
    }
}

