package com.infinance.queries.dto;

import com.infinance.queries.entity.FinanceQuery;
import com.infinance.queries.entity.PreferredContactMethod;
import com.infinance.queries.entity.QueryCategory;
import com.infinance.queries.entity.QueryStatus;

import java.time.Instant;

public record QueryDetailDto(
        String id,
        String referenceId,
        String name,
        String email,
        String phone,
        QueryCategory category,
        String categoryDisplayName,
        String subject,
        String message,
        PreferredContactMethod preferredContact,
        QueryStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static QueryDetailDto fromEntity(FinanceQuery query) {
        return new QueryDetailDto(
                query.getId(),
                query.getReferenceId(),
                query.getName(),
                query.getEmail(),
                query.getPhone(),
                query.getCategory(),
                query.getCategory() != null ? query.getCategory().getDisplayName() : null,
                query.getSubject(),
                query.getMessage(),
                query.getPreferredContact(),
                query.getStatus(),
                query.getCreatedAt(),
                query.getUpdatedAt()
        );
    }
}
