package com.infinance.queries.dto;

import com.infinance.queries.entity.PreferredContactMethod;
import com.infinance.queries.entity.QueryCategory;
import jakarta.validation.constraints.*;

public record CreateQueryRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 80, message = "Full name must be between 2 and 80 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Please enter a valid email address")
        @Size(max = 320, message = "Email cannot exceed 320 characters")
        String email,

        @Pattern(regexp = "^$|^(\\+91[\\-\\s]?)?[6-9]\\d{9}$", message = "Please enter a valid 10-digit Indian mobile number")
        String phone,

        @NotNull(message = "Query category is required")
        QueryCategory category,

        @NotBlank(message = "Subject is required")
        @Size(min = 5, max = 120, message = "Subject must be between 5 and 120 characters")
        String subject,

        @NotBlank(message = "Query message is required")
        @Size(min = 20, max = 2000, message = "Query message must be between 20 and 2000 characters")
        String message,

        @NotNull(message = "Preferred contact method is required")
        PreferredContactMethod preferredContact,

        @AssertTrue(message = "You must agree to the educational disclaimer and consent to contact")
        boolean consent,

        String honeypot
) {}
