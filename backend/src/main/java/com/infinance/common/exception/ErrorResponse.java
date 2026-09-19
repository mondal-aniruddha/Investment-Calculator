package com.infinance.common.exception;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant timestamp,
        int status,
        String code,
        String message,
        List<FieldErrorItem> fieldErrors
) {
    public static ErrorResponse of(int status, String code, String message, List<FieldErrorItem> fieldErrors) {
        return new ErrorResponse(Instant.now(), status, code, message, fieldErrors);
    }

    public static ErrorResponse of(int status, String code, String message) {
        return new ErrorResponse(Instant.now(), status, code, message, List.of());
    }
}
