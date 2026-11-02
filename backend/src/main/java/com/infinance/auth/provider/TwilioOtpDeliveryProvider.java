package com.infinance.auth.provider;

import com.infinance.auth.config.OtpProperties;
import com.infinance.auth.dto.OtpChannel;
import com.infinance.common.exception.InvalidFinancialInputException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
@ConditionalOnProperty(name = "infinance.otp.provider", havingValue = "twilio")
public class TwilioOtpDeliveryProvider implements OtpDeliveryProvider {

    private static final Logger log = LoggerFactory.getLogger(TwilioOtpDeliveryProvider.class);
    private static final String TWILIO_MESSAGES_URL = "https://api.twilio.com/2010-04-01/Accounts/{accountSid}/Messages.json";

    private final OtpProperties properties;
    private final RestClient restClient;

    @Autowired
    public TwilioOtpDeliveryProvider(OtpProperties properties) {
        this(properties, createDefaultRestClient());
    }

    public TwilioOtpDeliveryProvider(OtpProperties properties, RestClient restClient) {
        this.properties = properties;
        this.restClient = restClient;
    }

    private static RestClient createDefaultRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        return RestClient.builder().requestFactory(factory).build();
    }

    @Override
    public void send(OtpChannel channel, String destinationE164, String code, String locale) {
        if (!properties.isEnabled()) {
            log.warn("OTP delivery is globally disabled in configuration; skipping dispatch to {}", mask(destinationE164));
            return;
        }

        OtpProperties.TwilioProperties twilio = properties.getTwilio();
        String accountSid = twilio.getAccountSid();
        String authToken = twilio.getAuthToken();

        if (accountSid == null || accountSid.isBlank() || authToken == null || authToken.isBlank()) {
            log.error("Twilio credentials missing during OTP send attempt");
            throw new InvalidFinancialInputException("OTP_DELIVERY_FAILED", "SMS/WhatsApp delivery service is unconfigured");
        }

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        String messageBody = "Your InFinance verification code is " + code + ". Valid for 5 minutes. Never share this code.";

        if (channel == OtpChannel.WHATSAPP) {
            String to = destinationE164.startsWith("whatsapp:") ? destinationE164 : "whatsapp:" + destinationE164;
            String from = twilio.getWhatsappFrom().startsWith("whatsapp:") ? twilio.getWhatsappFrom() : "whatsapp:" + twilio.getWhatsappFrom();
            formData.add("To", to);
            formData.add("From", from);

            if (twilio.getWhatsappContentSid() != null && !twilio.getWhatsappContentSid().isBlank()) {
                formData.add("ContentSid", twilio.getWhatsappContentSid());
                formData.add("ContentVariables", "{\"1\":\"" + code + "\"}");
            } else {
                formData.add("Body", messageBody);
            }
        } else {
            formData.add("To", destinationE164);
            formData.add("From", twilio.getSmsFrom());
            formData.add("Body", messageBody);
        }

        String authHeader = "Basic " + Base64.getEncoder().encodeToString(
                (accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8)
        );

        try {
            restClient.post()
                    .uri(TWILIO_MESSAGES_URL, accountSid)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formData)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Dispatched OTP message via Twilio [channel={}, destination={}]", channel, mask(destinationE164));
        } catch (Exception e) {
            log.error("Twilio OTP dispatch failed for channel={} destination={}: {}", channel, mask(destinationE164), e.getMessage());
            throw new InvalidFinancialInputException("OTP_DELIVERY_FAILED", "Failed to deliver verification code. Please try again later.");
        }
    }

    private String mask(String phone) {
        if (phone == null || phone.length() < 6) return "***";
        int len = phone.length();
        return phone.substring(0, 3) + "******" + phone.substring(len - 4);
    }
}

