package com.infinance.auth.service;

import com.infinance.auth.config.JwtProperties;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    @Test
    void createsAndReadsStatelessToken() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret("a-development-secret-that-is-at-least-32-bytes-long");
        properties.setExpiration(3600);
        JwtService service = new JwtService(properties);
        String token = service.createToken("user-1", "user@example.com");
        assertEquals("user-1", service.userId(token));
        assertTrue(service.expiresAt().isAfter(java.time.Instant.now()));
    }
}
