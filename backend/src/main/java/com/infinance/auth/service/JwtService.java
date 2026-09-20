package com.infinance.auth.service;

import com.infinance.auth.config.JwtProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
    private final JwtProperties properties;
    public JwtService(JwtProperties properties) { this.properties = properties; }
    private SecretKey key() { return Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8)); }
    public String createToken(String userId, String email) {
        Instant now = Instant.now(), expiry = now.plusSeconds(properties.getExpiration());
        return Jwts.builder().subject(userId).claim("email", email).issuedAt(Date.from(now))
                .expiration(Date.from(expiry)).signWith(key()).compact();
    }
    public String userId(String token) { return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload().getSubject(); }
    public Instant expiresAt() { return Instant.now().plusSeconds(properties.getExpiration()); }
}
