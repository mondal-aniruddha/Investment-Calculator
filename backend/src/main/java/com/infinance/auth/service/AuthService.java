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
        validatePasswordComplexity(request.password());
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) throw new InvalidFinancialInputException("EMAIL_IN_USE", "An account already exists for this email");
        String username = (request.username() != null && !request.username().isBlank()) ? request.username().trim() : null;
        if (username != null && users.existsByUsernameIgnoreCase(username)) {
            throw new InvalidFinancialInputException("USERNAME_IN_USE", "An account already exists for this username");
        }
        UserEntity user = users.save(new UserEntity(email, encoder.encode(request.password()), request.displayName().trim(), request.phone(), username));
        return response(user);
    }
    public AuthResponse login(LoginRequest request) {
        String identifier = request.identifier();
        UserEntity user = users.findByEmailIgnoreCaseOrUsernameIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new InvalidFinancialInputException("INVALID_CREDENTIALS", "Invalid email or password"));
        if (!encoder.matches(request.password(), user.getPasswordHash())) throw new InvalidFinancialInputException("INVALID_CREDENTIALS", "Invalid email or password");
        return response(user);
    }
    public ProfileResponse profile(String id) { return toProfile(find(id)); }
    public ProfileResponse update(String id, ProfileUpdateRequest request) { UserEntity u=find(id); u.setDisplayName(request.displayName().trim()); u.setPhone(request.phone()); return toProfile(users.save(u)); }
    @Transactional
    public void delete(String id) { find(id); scenarios.deleteByUserId(id); users.deleteById(id); }
    public UserEntity find(String id) { return users.findById(id).orElseThrow(() -> new InvalidFinancialInputException("ACCOUNT_NOT_FOUND", "Account not found")); }
    public ProfileResponse toProfile(UserEntity u) { return new ProfileResponse(u.getId(),u.getEmail(),u.getDisplayName(),u.getPhone(),u.getCreatedAt(),u.getUsername()); }
    private AuthResponse response(UserEntity u) { return new AuthResponse(jwt.createToken(u.getId(),u.getEmail()), jwt.expiresAt(), toProfile(u)); }

    private void validatePasswordComplexity(String password) {
        if (password == null || password.length() < 8) {
            throw new InvalidFinancialInputException("WEAK_PASSWORD", "Password must be at least 8 characters long");
        }
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
        }
        if (!hasUpper || !hasLower || !hasDigit) {
            throw new InvalidFinancialInputException("WEAK_PASSWORD", "Password must contain at least one uppercase letter, one lowercase letter, and one digit");
        }
    }
}
