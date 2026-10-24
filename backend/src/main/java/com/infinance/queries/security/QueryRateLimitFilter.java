package com.infinance.queries.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.infinance.common.config.ApiConstants;
import com.infinance.common.exception.ErrorResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
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
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class QueryRateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_SUBMISSIONS_PER_HOUR = 5;
    private static final Duration WINDOW_DURATION = Duration.ofHours(1);

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = JsonMapper.builder().findAndAddModules().build();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if ("POST".equalsIgnoreCase(request.getMethod()) && ApiConstants.QUERIES.equals(request.getRequestURI())) {
            String ip = getClientIp(request);
            Bucket bucket = buckets.computeIfAbsent(ip, ignored -> Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(MAX_SUBMISSIONS_PER_HOUR)
                            .refillIntervally(MAX_SUBMISSIONS_PER_HOUR, WINDOW_DURATION).build())
                    .build());

            if (!bucket.tryConsume(1)) {
                String correlationId = request.getHeader("X-Correlation-ID");
                if (correlationId == null || correlationId.isBlank()) {
                    correlationId = MDC.get("correlationId");
                }

                response.setStatus(429);
                response.setHeader("Retry-After", "3600");
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                ErrorResponse error = ErrorResponse.of(
                        429,
                        "RATE_LIMIT_EXCEEDED",
                        "Too many query submissions from this IP. Please retry in 1 hour.",
                        List.of(),
                        correlationId
                );
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
