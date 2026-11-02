package com.infinance.auth.provider;

import com.infinance.auth.dto.OtpChannel;

public interface OtpDeliveryProvider {
    void send(OtpChannel channel, String destinationE164, String code, String locale);
}

