package com.infinance.auth.provider;

import com.infinance.auth.dto.OtpChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "infinance.otp.provider", havingValue = "dev", matchIfMissing = true)
public class DevOtpDeliveryProvider implements OtpDeliveryProvider {

    private static final Logger log = LoggerFactory.getLogger(DevOtpDeliveryProvider.class);

    private volatile String lastSentCode;
    private volatile String lastDestination;
    private volatile OtpChannel lastChannel;

    @Override
    public void send(OtpChannel channel, String destinationE164, String code, String locale) {
        this.lastChannel = channel;
        this.lastDestination = destinationE164;
        this.lastSentCode = code;
        log.debug("DEV OTP dispatched [channel={}, destination={}, code={}]", channel, mask(destinationE164), code);
    }

    public String getLastSentCode() {
        return lastSentCode;
    }

    public String getLastDestination() {
        return lastDestination;
    }

    public OtpChannel getLastChannel() {
        return lastChannel;
    }

    private String mask(String phone) {
        if (phone == null || phone.length() < 6) return "***";
        int len = phone.length();
        return phone.substring(0, 3) + "******" + phone.substring(len - 4);
    }
}

