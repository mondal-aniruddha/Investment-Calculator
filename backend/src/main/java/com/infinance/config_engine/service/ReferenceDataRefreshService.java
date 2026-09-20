package com.infinance.config_engine.service;

import com.infinance.common.config.RefreshProperties;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ReferenceDataRefreshService {
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
        probe("amfi", properties.getAmfiUrl());
        probe("repo-rate", properties.getRepoRateUrl());
        probe("cpi", properties.getCpiUrl());
    }

    public Map<String, RefreshStatus> getStatus() { return Map.copyOf(status); }

    private void probe(String key, String url) {
        if (url == null || url.isBlank()) {
            status.putIfAbsent(key, new RefreshStatus(null, null, "NOT_CONFIGURED"));
            return;
        }
        try {
            client.get().uri(url).retrieve().toBodilessEntity();
            status.put(key, new RefreshStatus(Instant.now(), Instant.now(), "REFRESHED"));
        } catch (RuntimeException ex) {
            RefreshStatus previous = status.get(key);
            status.put(key, new RefreshStatus(previous == null ? null : previous.lastSuccessfulAt(),
                    Instant.now(), previous == null ? "FALLBACK_NO_VALUE" : "FALLBACK_LAST_KNOWN"));
        }
    }

    public record RefreshStatus(Instant lastSuccessfulAt, Instant lastAttemptAt, String state) {}
}
