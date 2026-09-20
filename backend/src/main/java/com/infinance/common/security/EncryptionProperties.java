package com.infinance.common.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "infinance.security.encryption")
public class EncryptionProperties {
    private String secret = "development-only-encryption-secret";
    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }
}
