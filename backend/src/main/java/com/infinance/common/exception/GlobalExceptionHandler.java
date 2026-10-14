package com.infinance.common.exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final int UNPROCESSABLE_ENTITY_STATUS = 422;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] Request validation failed: {} error(s)", correlationId, ex.getBindingResult().getErrorCount());

        List<FieldErrorItem> fieldErrors = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.add(new FieldErrorItem(
                    fieldError.getField(),
                    fieldError.getRejectedValue(),
                    fieldError.getDefaultMessage()
            ));
        }

        ErrorResponse response = ErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                "VALIDATION_FAILED",
                "Input validation failed for one or more fields",
                fieldErrors,
                correlationId
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> handleHandlerMethodValidationException(HandlerMethodValidationException ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] Handler method parameter validation failed", correlationId);

        List<FieldErrorItem> fieldErrors = new ArrayList<>();
        ex.getAllValidationResults().forEach(result -> {
            String paramName = result.getMethodParameter().getParameterName();
            result.getResolvableErrors().forEach(error -> {
                fieldErrors.add(new FieldErrorItem(
                        paramName != null ? paramName : "parameter",
                        null,
                        error.getDefaultMessage()
                ));
            });
        });

        ErrorResponse response = ErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                "VALIDATION_FAILED",
                "Input parameter validation failed",
                fieldErrors,
                correlationId
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] Constraint violation: {}", correlationId, ex.getMessage());

        List<FieldErrorItem> fieldErrors = new ArrayList<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String propertyPath = violation.getPropertyPath() != null ? violation.getPropertyPath().toString() : "field";
            fieldErrors.add(new FieldErrorItem(
                    propertyPath,
                    violation.getInvalidValue(),
                    violation.getMessage()
            ));
        }

        ErrorResponse response = ErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                "VALIDATION_FAILED",
                "Constraint validation failed",
                fieldErrors,
                correlationId
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(InvalidFinancialInputException.class)
    public ResponseEntity<ErrorResponse> handleFinancialInputException(InvalidFinancialInputException ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] Business financial input error: {}", correlationId, ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
                UNPROCESSABLE_ENTITY_STATUS,
                ex.getErrorCode(),
                ex.getMessage(),
                List.of(),
                correlationId
        );
        return ResponseEntity.status(UNPROCESSABLE_ENTITY_STATUS).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] Malformed JSON request payload: {}", correlationId, ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                "MALFORMED_JSON",
                "Malformed JSON request payload",
                List.of(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] Unsupported media type: {}", correlationId, ex.getContentType());
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.UNSUPPORTED_MEDIA_TYPE.value(),
                "UNSUPPORTED_MEDIA_TYPE",
                "Content-Type not supported: " + ex.getContentType(),
                List.of(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(response);
    }

    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    public ResponseEntity<ErrorResponse> handleMediaTypeNotAcceptable(HttpMediaTypeNotAcceptableException ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] Media type not acceptable: {}", correlationId, ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.NOT_ACCEPTABLE.value(),
                "NOT_ACCEPTABLE",
                "Requested Accept header cannot be fulfilled",
                List.of(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(response);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] HTTP method not supported: {}", correlationId, ex.getMethod());
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.METHOD_NOT_ALLOWED.value(),
                "METHOD_NOT_ALLOWED",
                "HTTP method " + ex.getMethod() + " is not allowed for this endpoint",
                List.of(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }

    @ExceptionHandler({MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> handleParameterException(Exception ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] Invalid or missing request parameter: {}", correlationId, ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                "INVALID_REQUEST_PARAMETER",
                "Invalid or missing request parameter",
                List.of(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] Access denied: {}", correlationId, ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.FORBIDDEN.value(),
                "FORBIDDEN",
                "Access is denied to this resource",
                List.of(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] Authentication failure: {}", correlationId, ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.UNAUTHORIZED.value(),
                "UNAUTHORIZED",
                "Full authentication is required to access this resource",
                List.of(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(com.infinance.metals.exception.MetalsServiceUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleMetalsServiceUnavailable(com.infinance.metals.exception.MetalsServiceUnavailableException ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] Metals market data unavailable: {}", correlationId, ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "METALS_SERVICE_UNAVAILABLE",
                "Live metal reference prices are temporarily unavailable. Please try again later.",
                List.of(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @ExceptionHandler(com.infinance.metals.exception.MetalsProviderException.class)
    public ResponseEntity<ErrorResponse> handleMetalsProviderException(com.infinance.metals.exception.MetalsProviderException ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] Metals provider failure: {}", correlationId, ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "UPSTREAM_PROVIDER_FAILURE",
                "External market data provider temporarily unavailable. Please try again later.",
                List.of(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @ExceptionHandler({RestClientResponseException.class, ResourceAccessException.class})
    public ResponseEntity<ErrorResponse> handleRestClientException(Exception ex) {
        String correlationId = MDC.get("correlationId");
        log.warn("[correlationId={}] Upstream HTTP service failure: {}", correlationId, ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "UPSTREAM_PROVIDER_FAILURE",
                "External service communication failed. Please try again later.",
                List.of(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
        String correlationId = MDC.get("correlationId");
        int statusCode = ex.getStatusCode().value();
        String code = statusCode == 429 ? "RATE_LIMIT_EXCEEDED" : ex.getStatusCode().toString();
        String message = ex.getReason() != null ? ex.getReason() : (statusCode == 429 ? "Rate limit exceeded. Please try again later." : ex.getMessage());

        log.warn("[correlationId={}] Response status exception (status={}): {}", correlationId, statusCode, message);
        ErrorResponse response = ErrorResponse.of(
                statusCode,
                code,
                message,
                List.of(),
                correlationId
        );
        return ResponseEntity.status(ex.getStatusCode()).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        String correlationId = MDC.get("correlationId");
        log.error("[correlationId={}] Unhandled internal server error occurred: {}", correlationId, ex.getMessage(), ex);
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred while processing your request. Please try again later.",
                List.of(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
