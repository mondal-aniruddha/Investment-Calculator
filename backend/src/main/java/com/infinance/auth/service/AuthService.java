package com.infinance.auth.service;

import com.infinance.auth.dto.AuthDtos.*;
import com.infinance.auth.entity.UserEntity;
import com.infinance.auth.repository.UserRepository;
import com.infinance.auth.repository.SavedScenarioRepository;
import com.infinance.common.exception.InvalidFinancialInputException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;

@Service
public class AuthService {
    private final UserRepository users; private final SavedScenarioRepository scenarios; private final PasswordEncoder encoder; private final JwtService jwt;
    public AuthService(UserRepository users, SavedScenarioRepository scenarios, PasswordEncoder encoder, JwtService jwt) { this.users=users; this.scenarios=scenarios; this.encoder=encoder; this.jwt=jwt; }
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) throw new InvalidFinancialInputException("EMAIL_IN_USE", "An account already exists for this email");
        UserEntity user = users.save(new UserEntity(email, encoder.encode(request.password()), request.displayName().trim(), request.phone()));
        return response(user);
    }
    public AuthResponse login(LoginRequest request) {
        UserEntity user = users.findByEmailIgnoreCase(request.email().trim()).orElseThrow(() -> new InvalidFinancialInputException("INVALID_CREDENTIALS", "Invalid email or password"));
        if (!encoder.matches(request.password(), user.getPasswordHash())) throw new InvalidFinancialInputException("INVALID_CREDENTIALS", "Invalid email or password");
        return response(user);
    }
    public ProfileResponse profile(String id) { return toProfile(find(id)); }
    public ProfileResponse update(String id, ProfileUpdateRequest request) { UserEntity u=find(id); u.setDisplayName(request.displayName().trim()); u.setPhone(request.phone()); return toProfile(users.save(u)); }
    @Transactional
    public void delete(String id) { find(id); scenarios.deleteByUserId(id); users.deleteById(id); }
    public UserEntity find(String id) { return users.findById(id).orElseThrow(() -> new InvalidFinancialInputException("ACCOUNT_NOT_FOUND", "Account not found")); }
    public ProfileResponse toProfile(UserEntity u) { return new ProfileResponse(u.getId(),u.getEmail(),u.getDisplayName(),u.getPhone(),u.getCreatedAt()); }
    private AuthResponse response(UserEntity u) { return new AuthResponse(jwt.createToken(u.getId(),u.getEmail()), jwt.expiresAt(), toProfile(u)); }
}
