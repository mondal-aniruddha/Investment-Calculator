package com.infinance.common.exception;

public record FieldErrorItem(
        String field,
        Object rejectedValue,
        String message
) {}
