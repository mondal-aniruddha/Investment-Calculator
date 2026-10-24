package com.infinance.queries.dto;

/**
 * Public DTO returned by GET /api/v1/config/team for a single team member.
 * Names, emails, and WhatsApp numbers are intentionally public contact details.
 */
public record TeamMemberDto(
        String id,
        String name,
        String role,
        String shortBio,
        String whatsapp,
        String email,
        String initials
) {}
