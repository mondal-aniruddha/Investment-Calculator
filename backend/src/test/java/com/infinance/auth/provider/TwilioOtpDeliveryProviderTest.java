package com.infinance.auth.provider;

import com.infinance.auth.config.OtpProperties;
import com.infinance.auth.dto.OtpChannel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class TwilioOtpDeliveryProviderTest {

    private OtpProperties properties;
    private MockRestServiceServer mockServer;
    private TwilioOtpDeliveryProvider provider;

    @BeforeEach
    void setUp() {
        properties = new OtpProperties();
        properties.setEnabled(true);
        properties.setProvider("twilio");
        OtpProperties.TwilioProperties twilio = properties.getTwilio();
        twilio.setAccountSid("ACtest1234567890abcdef1234567890ab");
        twilio.setAuthToken("authtoken1234567890abcdef12345678");
        twilio.setSmsFrom("+15005550006");
        twilio.setWhatsappFrom("+15005550007");
        twilio.setWhatsappContentSid("HXtestTemplateId123456");

        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();
        provider = new TwilioOtpDeliveryProvider(properties, builder.build());
    }

    @Test
    @DisplayName("Twilio SMS dispatch constructs correct URL, basic auth, and body parameters")
    void testSendSms() {
        mockServer.expect(requestTo("https://api.twilio.com/2010-04-01/Accounts/ACtest1234567890abcdef1234567890ab/Messages.json"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", org.hamcrest.Matchers.startsWith("Basic ")))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("To=%2B919876543210")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("From=%2B15005550006")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Body=")))
                .andRespond(withSuccess("{\"sid\":\"SM12345\"}", MediaType.APPLICATION_JSON));

        provider.send(OtpChannel.SMS, "+919876543210", "654321", "en");
        mockServer.verify();
    }

    @Test
    @DisplayName("Twilio WhatsApp dispatch includes whatsapp: prefix and ContentSid template")
    void testSendWhatsApp() {
        mockServer.expect(requestTo("https://api.twilio.com/2010-04-01/Accounts/ACtest1234567890abcdef1234567890ab/Messages.json"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", org.hamcrest.Matchers.startsWith("Basic ")))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("To=whatsapp%3A%2B919876543210")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("From=whatsapp%3A%2B15005550007")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("ContentSid=HXtestTemplateId123456")))
                .andRespond(withSuccess("{\"sid\":\"SM67890\"}", MediaType.APPLICATION_JSON));

        provider.send(OtpChannel.WHATSAPP, "+919876543210", "123456", "en");
        mockServer.verify();
    }
}

