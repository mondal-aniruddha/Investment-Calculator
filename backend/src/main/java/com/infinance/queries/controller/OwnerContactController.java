package com.infinance.queries.controller;

import com.infinance.common.config.ApiConstants;
import com.infinance.queries.config.OwnerContactProperties;
import com.infinance.queries.config.TeamProperties;
import com.infinance.queries.dto.OwnerContactDto;
import com.infinance.queries.dto.TeamMemberDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(ApiConstants.CONFIG)
@Tag(name = "Configuration", description = "Public configuration endpoints")
public class OwnerContactController {

    private final OwnerContactProperties ownerProperties;
    private final TeamProperties teamProperties;

    public OwnerContactController(OwnerContactProperties ownerProperties,
                                  TeamProperties teamProperties) {
        this.ownerProperties = ownerProperties;
        this.teamProperties = teamProperties;
    }

    /**
     * Legacy single-owner endpoint — preserved for backward compatibility.
     * Frontend and any existing integrations that call /api/v1/config/owner-contact
     * continue to work unchanged.
     */
    @GetMapping("/owner-contact")
    @Operation(
            summary = "Get site owner contact information (legacy)",
            description = "Returns the founder's name, WhatsApp number, and consultation email. " +
                          "Prefer GET /api/v1/config/team for the full team list.")
    public ResponseEntity<OwnerContactDto> getOwnerContact() {
        return ResponseEntity.ok(new OwnerContactDto(
                ownerProperties.getName(),
                ownerProperties.getWhatsapp(),
                ownerProperties.getEmail()
        ));
    }

    /**
     * New team endpoint — returns the ordered list of founders / team members.
     */
    @GetMapping("/team")
    @Operation(
            summary = "Get team member list",
            description = "Returns an ordered list of team members (founder + co-founder), " +
                          "each with id, name, role, shortBio, WhatsApp number, email, and initials.")
    public ResponseEntity<List<TeamMemberDto>> getTeam() {
        List<TeamMemberDto> dtos = teamProperties.getTeam().stream()
                .map(m -> new TeamMemberDto(
                        m.getId(),
                        m.getName(),
                        m.getRole(),
                        m.getShortBio(),
                        m.getWhatsapp(),
                        m.getEmail(),
                        m.getInitials()
                ))
                .toList();
        return ResponseEntity.ok(dtos);
    }
}
