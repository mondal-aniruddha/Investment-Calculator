package com.infinance.metals.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "infinance.metals")
public class MetalsProperties {

    /**
     * Whether the metals live reference price feature is enabled.
     */
    private boolean enabled = true;

    /**
     * Provider API key. Must only be populated via environment variable
     * INFINANCE_METALS_API_KEY.
     * Never exposed in client code, bundles, logs, or error responses.
     */
    private String apiKey = "";

    /**
     * Provider selection: 'metals-dev' or 'metals-api'.
     */
    private String provider = "metals-dev";

    /**
     * Authority for metals.dev provider (e.g. 'mcx').
     */
    private String authority = "mcx";

    /**
     * Base URL for the upstream provider API.
     */
    private String baseUrl = "https://api.metals.dev";

    /**
     * Base currency for quotes. Defaults to INR for Indian domestic reference
     * pricing.
     */
    private String baseCurrency = "INR";

    /**
     * Comma-separated list of symbols to request (XAU=Gold, XAG=Silver,
     * XPT=Platinum, XPD=Palladium).
     */
    private String symbols = "XAU,XAG,XPT,XPD";

    /**
     * Unit returned or requested: 'g' (gram) or 'toz' (troy ounce).
     */
    private String unit = "g";

    /**
     * Direction of the rate returned by the provider:
     * - INVERSE: 1 unit of base currency buys X units of metal (standard
     * Forex/Metals-API format: price = 1 / rate)
     * - DIRECT: 1 unit of metal costs X units of base currency (price = rate)
     */
    private RateDirection rateDirection = RateDirection.INVERSE;

    /**
     * Connect timeout in milliseconds for HTTP client.
     */
    private int connectTimeoutMs = 3000;

    /**
     * Read timeout in milliseconds for HTTP client.
     */
    private int readTimeoutMs = 5000;

    /**
     * Fresh cache TTL in minutes. Bounded cache serves fresh data within this
     * window.
     */
    private int cacheTtlMinutes = 5;

    /**
     * Stale fallback TTL in hours. If upstream fails, the last successful result is
     * served up to this age.
     */
    private int staleTtlHours = 24;

    /**
     * Human-readable label of the upstream data provider.
     */
    private String providerLabel = "metals.dev";

    /**
     * Selected provider plan tier documentation.
     */
    private String planTier = "Free / Starter (MCX reference pricing)";

    /**
     * Educational disclaimer attached to responses.
     */
    private String disclaimer = "Indicative MCX reference prices for financial planning and educational purposes only; not local jewellery retail prices (excludes GST, making charges, margins) and not for trading.";

    public enum RateDirection {
        INVERSE,
        DIRECT
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getBaseCurrency() {
        return baseCurrency;
    }

    public void setBaseCurrency(String baseCurrency) {
        this.baseCurrency = baseCurrency;
    }

    public String getSymbols() {
        return symbols;
    }

    public void setSymbols(String symbols) {
        this.symbols = symbols;
    }

    public List<String> getSymbolList() {
        if (symbols == null || symbols.isBlank()) {
            return List.of("XAU", "XAG", "XPT", "XPD");
        }
        String[] parts = symbols.split(",");
        List<String> list = new java.util.ArrayList<>(parts.length);
        for (String part : parts) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) {
                list.add(trimmed);
            }
        }
        return java.util.Collections.unmodifiableList(list);
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public RateDirection getRateDirection() {
        return rateDirection;
    }

    public void setRateDirection(RateDirection rateDirection) {
        this.rateDirection = rateDirection;
    }

    public int getConnectTimeoutMs() {
        return connectTimeoutMs;
    }

    public void setConnectTimeoutMs(int connectTimeoutMs) {
        this.connectTimeoutMs = connectTimeoutMs;
    }

    public int getReadTimeoutMs() {
        return readTimeoutMs;
    }

    public void setReadTimeoutMs(int readTimeoutMs) {
        this.readTimeoutMs = readTimeoutMs;
    }

    public int getCacheTtlMinutes() {
        return cacheTtlMinutes;
    }

    public void setCacheTtlMinutes(int cacheTtlMinutes) {
        this.cacheTtlMinutes = cacheTtlMinutes;
    }

    public int getStaleTtlHours() {
        return staleTtlHours;
    }

    public void setStaleTtlHours(int staleTtlHours) {
        this.staleTtlHours = staleTtlHours;
    }

    public String getProviderLabel() {
        return providerLabel;
    }

    public void setProviderLabel(String providerLabel) {
        this.providerLabel = providerLabel;
    }

    public String getPlanTier() {
        return planTier;
    }

    public void setPlanTier(String planTier) {
        this.planTier = planTier;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getAuthority() {
        return authority;
    }

    public void setAuthority(String authority) {
        this.authority = authority;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}
