package com.infinance.auth.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinance.auth.dto.AuthDtos.LoginRequest;
import com.infinance.auth.dto.AuthDtos.RegisterRequest;
import com.infinance.auth.security.LoginRateLimitFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LoginRateLimitFilter loginRateLimitFilter;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        loginRateLimitFilter.reset();
    }

    @Test
    @DisplayName("POST /api/v1/auth/register should succeed with valid data and complex password")
    void shouldRegisterUserSuccessfully() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "john.doe@example.com",
                "Password123!",
                "John Doe",
                "+919876543210",
                "john_doe"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.profile.email", is("john.doe@example.com")))
                .andExpect(jsonPath("$.profile.displayName", is("John Doe")))
                .andExpect(jsonPath("$.profile.username", is("john_doe")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register should reject weak password")
    void shouldRejectWeakPassword() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "weak@example.com",
                "lowercaseonly",
                "Weak Pass User",
                null,
                "weakuser"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.code", is("WEAK_PASSWORD")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register should reject duplicate email")
    void shouldRejectDuplicateEmail() throws Exception {
        RegisterRequest req1 = new RegisterRequest(
                "duplicate.email@example.com",
                "StrongPass123",
                "User One",
                null,
                "user_one"
        );
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk());

        RegisterRequest req2 = new RegisterRequest(
                "DUPLICATE.EMAIL@example.com",
                "StrongPass123",
                "User Two",
                null,
                "user_two"
        );
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.code", is("EMAIL_IN_USE")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register should reject duplicate username")
    void shouldRejectDuplicateUsername() throws Exception {
        RegisterRequest req1 = new RegisterRequest(
                "user.a@example.com",
                "StrongPass123",
                "User A",
                null,
                "unique_user"
        );
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk());

        RegisterRequest req2 = new RegisterRequest(
                "user.b@example.com",
                "StrongPass123",
                "User B",
                null,
                "UNIQUE_USER"
        );
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.code", is("USERNAME_IN_USE")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login should allow login with email or username")
    void shouldLoginWithEmailOrUsername() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "login.test@example.com",
                "Password123!",
                "Login Test",
                null,
                "logintester"
        );
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        // Login with email
        LoginRequest loginWithEmail = new LoginRequest("login.test@example.com", "Password123!");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginWithEmail)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()));

        // Login with username via email field
        LoginRequest loginWithUsername = new LoginRequest("logintester", "Password123!");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginWithUsername)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/v1/auth/profile and /me alias should return profile with Bearer token, 401 without")
    void shouldSupportProfileAndMeAlias() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "alias.test@example.com",
                "Password123!",
                "Alias Tester",
                "+911122334455",
                "aliastester"
        );
        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(regResult.getResponse().getContentAsString());
        String token = root.get("token").asText();

        // Access /profile with token
        mockMvc.perform(get("/api/v1/auth/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("alias.test@example.com")))
                .andExpect(jsonPath("$.username", is("aliastester")));

        // Access /me with token
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("alias.test@example.com")))
                .andExpect(jsonPath("$.username", is("aliastester")));

        // Access without token should return 401 with UNAUTHORIZED ErrorResponse
        mockMvc.perform(get("/api/v1/auth/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("UNAUTHORIZED")));

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("UNAUTHORIZED")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login should enforce rate limit after 5 attempts")
    void shouldEnforceLoginRateLimit() throws Exception {
        LoginRequest badLogin = new LoginRequest("nobody@example.com", "WrongPassword123!");
        String testIp = "192.168.1.100";

        // Perform 5 attempts
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .header("X-Forwarded-For", testIp)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(badLogin)))
                    .andExpect(status().is(422));
        }

        // 6th attempt should be rate limited with 429
        mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Forwarded-For", testIp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().is(429))
                .andExpect(jsonPath("$.code", is("TOO_MANY_REQUESTS")));
    }
}
