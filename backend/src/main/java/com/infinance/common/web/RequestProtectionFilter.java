package com.infinance.common.web;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RequestProtectionFilter extends OncePerRequestFilter {
    private static final long MAX_REQUEST_BYTES = 1_048_576L;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final MeterRegistry meterRegistry;

    public RequestProtectionFilter(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String correlationId = request.getHeader("X-Correlation-ID");
        if (correlationId == null || correlationId.isBlank() || correlationId.length() > 100) {
            correlationId = UUID.randomUUID().toString();
        }
        response.setHeader("X-Correlation-ID", correlationId);
        MDC.put("correlationId", correlationId);
        meterRegistry.counter("infinance.http.requests", "method", request.getMethod(),
                "path", request.getRequestURI()).increment();
        try {
            if (request.getContentLengthLong() > MAX_REQUEST_BYTES) {
                response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write("{\"error\":\"REQUEST_TOO_LARGE\",\"message\":\"Request body exceeds 1 MB\"}");
                return;
            }
            String key = request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
            Bucket bucket = buckets.computeIfAbsent(key, ignored -> Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(120)
                            .refillIntervally(120, Duration.ofMinutes(1)).build()).build());
            if (!bucket.tryConsume(1)) {
                response.setStatus(429);
                response.setHeader("Retry-After", "60");
                return;
            }
            chain.doFilter(request, response);
        } finally {
            MDC.remove("correlationId");
        }
    }
}
