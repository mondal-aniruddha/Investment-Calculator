package com.infinance.queries.controller;

import com.infinance.common.config.ApiConstants;
import com.infinance.queries.config.OwnerContactProperties;
import com.infinance.queries.dto.OwnerContactDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.CONFIG)
@Tag(name = "Configuration", description = "Public configuration endpoints")
public class OwnerContactController {

    private final OwnerContactProperties properties;

    public OwnerContactController(OwnerContactProperties properties) {
        this.properties = properties;
    }

    @GetMapping("/owner-contact")
    @Operation(summary = "Get site owner contact information",
            description = "Returns the site owner's name, public contact phone, and consultation email.")
    public ResponseEntity<OwnerContactDto> getOwnerContact() {
        return ResponseEntity.ok(new OwnerContactDto(
                properties.getName(),
                properties.getWhatsapp(),
                properties.getEmail()
        ));
    }
}
