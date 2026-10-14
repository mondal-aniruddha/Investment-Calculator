package com.infinance.configengine.service;

import com.infinance.common.config.RefreshProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ReferenceDataRefreshService {

    private static final Logger log = LoggerFactory.getLogger(ReferenceDataRefreshService.class);

    private final RefreshProperties properties;
    private final RestClient client;
    private final Map<String, RefreshStatus> status = new ConcurrentHashMap<>();

    public ReferenceDataRefreshService(RefreshProperties properties) {
        this.properties = properties;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(5000);
        this.client = RestClient.builder().requestFactory(factory).build();
    }

    @Scheduled(fixedDelayString = "${infinance.refresh.fixed-delay-ms:86400000}")
    public void refresh() {
        if (!properties.isEnabled()) return;
        String correlationId = UUID.randomUUID().toString();
        MDC.put("correlationId", correlationId);
        try {
            probe("amfi", properties.getAmfiUrl(), correlationId);
            probe("repo-rate", properties.getRepoRateUrl(), correlationId);
            probe("cpi", properties.getCpiUrl(), correlationId);
        } finally {
            MDC.remove("correlationId");
        }
    }

    public Map<String, RefreshStatus> getStatus() { return Map.copyOf(status); }

    private void probe(String key, String url, String correlationId) {
        if (url == null || url.isBlank()) {
            status.putIfAbsent(key, new RefreshStatus(null, null, "NOT_CONFIGURED"));
            return;
        }
        try {
            client.get().uri(url).retrieve().toBodilessEntity();
            status.put(key, new RefreshStatus(Instant.now(), Instant.now(), "REFRESHED"));
            log.debug("[correlationId={}] Successfully refreshed reference data for '{}'", correlationId, key);
        } catch (RuntimeException ex) {
            log.warn("[correlationId={}] Failed to refresh reference data for '{}' at URL {}: {}",
                    correlationId, key, url, ex.getMessage());
            RefreshStatus previous = status.get(key);
            status.put(key, new RefreshStatus(previous == null ? null : previous.lastSuccessfulAt(),
                    Instant.now(), previous == null ? "FALLBACK_NO_VALUE" : "FALLBACK_LAST_KNOWN"));
        }
    }

    public record RefreshStatus(Instant lastSuccessfulAt, Instant lastAttemptAt, String state) {}
}
