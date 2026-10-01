package com.infinance.metals.exception;

public class MetalsServiceUnavailableException extends RuntimeException {
    public MetalsServiceUnavailableException(String message) {
        super(message);
    }

    public MetalsServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
