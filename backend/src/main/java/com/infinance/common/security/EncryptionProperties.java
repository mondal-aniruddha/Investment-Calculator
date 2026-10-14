package com.infinance.common.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "infinance.security.encryption")
@Validated
public class EncryptionProperties {
    private String secret = "development-only-encryption-secret";

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }
}
