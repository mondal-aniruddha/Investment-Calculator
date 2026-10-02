package com.infinance.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
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
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration WINDOW_DURATION = Duration.ofMinutes(15);
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = JsonMapper.builder().findAndAddModules().build();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if ("POST".equalsIgnoreCase(request.getMethod()) && "/api/v1/auth/login".equals(request.getRequestURI())) {
            String ip = getClientIp(request);
            Bucket bucket = buckets.computeIfAbsent(ip, ignored -> Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(MAX_ATTEMPTS)
                            .refillIntervally(MAX_ATTEMPTS, WINDOW_DURATION).build())
                    .build());

            if (!bucket.tryConsume(1)) {
                response.setStatus(429);
                response.setHeader("Retry-After", "900");
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                ErrorResponse error = ErrorResponse.of(429, "TOO_MANY_REQUESTS",
                        "Too many login attempts. Please try again in 15 minutes.");
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
