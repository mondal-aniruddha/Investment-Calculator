package com.infinance.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "infinance.otp")
public class OtpProperties {

    public static final String DEV_SECRET_DEFAULT = "development-only-otp-hmac-secret-at-least-32-chars";

    private boolean enabled = true;
    private String provider = "dev";
    private int codeLength = 6;
    private int ttlSeconds = 300;
    private int maxAttempts = 5;
    private int resendCooldownSeconds = 60;
    private int maxSendsPerPhonePerHour = 5;
    private int maxSendsPerIpHour = 10;
    private List<String> allowedCountryCodes = new ArrayList<>(List.of("+91"));
    private String secret = DEV_SECRET_DEFAULT;

    private TwilioProperties twilio = new TwilioProperties();

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public int getCodeLength() { return codeLength; }
    public void setCodeLength(int codeLength) { this.codeLength = codeLength; }

    public int getTtlSeconds() { return ttlSeconds; }
    public void setTtlSeconds(int ttlSeconds) { this.ttlSeconds = ttlSeconds; }

    public int getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(int maxAttempts) { this.maxAttempts = maxAttempts; }

    public int getResendCooldownSeconds() { return resendCooldownSeconds; }
    public void setResendCooldownSeconds(int resendCooldownSeconds) { this.resendCooldownSeconds = resendCooldownSeconds; }

    public int getMaxSendsPerPhonePerHour() { return maxSendsPerPhonePerHour; }
    public void setMaxSendsPerPhonePerHour(int maxSendsPerPhonePerHour) { this.maxSendsPerPhonePerHour = maxSendsPerPhonePerHour; }

    public int getMaxSendsPerIpHour() { return maxSendsPerIpHour; }
    public void setMaxSendsPerIpHour(int maxSendsPerIpHour) { this.maxSendsPerIpHour = maxSendsPerIpHour; }

    public List<String> getAllowedCountryCodes() { return allowedCountryCodes; }
    public void setAllowedCountryCodes(List<String> allowedCountryCodes) { this.allowedCountryCodes = allowedCountryCodes; }

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }

    public TwilioProperties getTwilio() { return twilio; }
    public void setTwilio(TwilioProperties twilio) { this.twilio = twilio; }

    public static class TwilioProperties {
        private String accountSid = "";
        private String authToken = "";
        private String smsFrom = "";
        private String whatsappFrom = "";
        private String whatsappContentSid = "";

        public String getAccountSid() { return accountSid; }
        public void setAccountSid(String accountSid) { this.accountSid = accountSid; }

        public String getAuthToken() { return authToken; }
        public void setAuthToken(String authToken) { this.authToken = authToken; }

        public String getSmsFrom() { return smsFrom; }
        public void setSmsFrom(String smsFrom) { this.smsFrom = smsFrom; }

        public String getWhatsappFrom() { return whatsappFrom; }
        public void setWhatsappFrom(String whatsappFrom) { this.whatsappFrom = whatsappFrom; }

        public String getWhatsappContentSid() { return whatsappContentSid; }
        public void setWhatsappContentSid(String whatsappContentSid) { this.whatsappContentSid = whatsappContentSid; }
    }
}

