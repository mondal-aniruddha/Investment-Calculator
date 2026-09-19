package com.infinance.common.exception;

public class InvalidFinancialInputException extends RuntimeException {

    private final String errorCode;

    public InvalidFinancialInputException(String message) {
        super(message);
        this.errorCode = "INVALID_FINANCIAL_INPUT";
    }

    public InvalidFinancialInputException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
