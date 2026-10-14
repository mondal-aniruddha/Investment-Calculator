package com.infinance.common.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.slf4j.MDC;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant timestamp,
        int status,
        String code,
        String message,
        List<FieldErrorItem> fieldErrors,
        String correlationId
) {
    public ErrorResponse(Instant timestamp, int status, String code, String message, List<FieldErrorItem> fieldErrors) {
        this(timestamp, status, code, message, fieldErrors, MDC.get("correlationId"));
    }

    public static ErrorResponse of(int status, String code, String message, List<FieldErrorItem> fieldErrors, String correlationId) {
        String resolvedCorrelationId = (correlationId != null && !correlationId.isBlank()) ? correlationId : MDC.get("correlationId");
        return new ErrorResponse(Instant.now(), status, code, message, fieldErrors != null ? List.copyOf(fieldErrors) : List.of(), resolvedCorrelationId);
    }

    public static ErrorResponse of(int status, String code, String message, List<FieldErrorItem> fieldErrors) {
        return of(status, code, message, fieldErrors, MDC.get("correlationId"));
    }

    public static ErrorResponse of(int status, String code, String message) {
        return of(status, code, message, List.of(), MDC.get("correlationId"));
    }
}
