package com.infinance.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.infinance.ai.dto.AiInsightRequest;
import com.infinance.ai.dto.AiInsightResponse;
import com.infinance.common.config.AiProperties;
import com.infinance.common.config.FinancialProperties;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class AiInsightService {
    private final AiProperties properties;
    private final FinancialProperties financialProperties;
    private final JsonMapper mapper = JsonMapper.builder().findAndAddModules().build();
    private final Cache cache;
    private final RestClient client = RestClient.create();

    public AiInsightService(AiProperties properties, FinancialProperties financialProperties,
                            CacheManager cacheManager) {
        this.properties = properties;
        this.financialProperties = financialProperties;
        this.cache = cacheManager.getCache("ai-insights");
    }

    public AiInsightResponse explain(AiInsightRequest request) {
        String disclaimer = financialProperties.getDisclaimer();
        if (!properties.isEnabled()) return new AiInsightResponse(false, null, disclaimer, "DISABLED");
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            return new AiInsightResponse(true, null, disclaimer, "NOT_CONFIGURED");
        }
        String serialized = write(request.calculationResult());
        String key = Integer.toHexString(serialized.hashCode());
        if (cache != null) {
            Cache.ValueWrapper value = cache.get(key);
            if (value != null) return (AiInsightResponse) value.get();
        }
        String prompt = properties.getPromptTemplate().replace("{{results}}", serialized);
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                JsonNode response = client.post().uri(properties.getEndpoint()).contentType(MediaType.APPLICATION_JSON)
                        .header("x-api-key", properties.getApiKey())
                        .header("anthropic-version", "2023-06-01")
                        .body(Map.of("model", properties.getModel(), "max_tokens", 700,
                                "messages", new Object[]{Map.of("role", "user", "content", prompt)}))
                        .retrieve().body(JsonNode.class);
                String text = response == null ? null : response.at("/content/0/text").asText(null);
                AiInsightResponse result = new AiInsightResponse(true, text, disclaimer, "GENERATED");
                if (cache != null) cache.put(key, result);
                return result;
            } catch (RuntimeException ex) {
                try { Thread.sleep(150L * (attempt + 1)); } catch (InterruptedException interrupted) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        return new AiInsightResponse(true, null, disclaimer, "UNAVAILABLE");
    }

    private String write(Object value) {
        try { return mapper.writeValueAsString(value); }
        catch (Exception ex) { return String.valueOf(value); }
    }
}
