package com.infinance.metals.exception;

public class MetalsProviderException extends RuntimeException {
    public MetalsProviderException(String message) {
        super(message);
    }

    public MetalsProviderException(String message, Throwable cause) {
        super(message, cause);
    }
}
