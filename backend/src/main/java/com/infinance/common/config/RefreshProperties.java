package com.infinance.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "infinance.refresh")
public class RefreshProperties {
    private boolean enabled;
    private String amfiUrl;
    private String repoRateUrl;
    private String cpiUrl;
    private long fixedDelayMs = 86400000L;

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getAmfiUrl() { return amfiUrl; }
    public void setAmfiUrl(String amfiUrl) { this.amfiUrl = amfiUrl; }
    public String getRepoRateUrl() { return repoRateUrl; }
    public void setRepoRateUrl(String repoRateUrl) { this.repoRateUrl = repoRateUrl; }
    public String getCpiUrl() { return cpiUrl; }
    public void setCpiUrl(String cpiUrl) { this.cpiUrl = cpiUrl; }
    public long getFixedDelayMs() { return fixedDelayMs; }
    public void setFixedDelayMs(long fixedDelayMs) { this.fixedDelayMs = fixedDelayMs; }
}
