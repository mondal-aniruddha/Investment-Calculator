package com.infinance.auth.dto;

public enum OtpChannel {
    SMS,
    WHATSAPP;

    public static OtpChannel fromString(String value) {
        if (value == null || value.isBlank()) return SMS;
        try {
            return OtpChannel.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return SMS;
        }
    }
}

