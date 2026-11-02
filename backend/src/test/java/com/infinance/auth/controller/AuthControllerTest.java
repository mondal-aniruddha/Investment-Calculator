package com.infinance.auth.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinance.auth.dto.*;
import com.infinance.auth.entity.UserEntity;
import com.infinance.auth.provider.DevOtpDeliveryProvider;
import com.infinance.auth.repository.UserRepository;
import com.infinance.auth.security.LoginRateLimitFilter;
import com.infinance.auth.security.OtpRateLimitFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private LoginRateLimitFilter loginRateLimitFilter;

        @Autowired
        private OtpRateLimitFilter otpRateLimitFilter;

        @Autowired
        private DevOtpDeliveryProvider devOtpDeliveryProvider;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        private final ObjectMapper objectMapper = new ObjectMapper();

        @BeforeEach
        void setUp() {
                loginRateLimitFilter.reset();
                otpRateLimitFilter.reset();
        }

        @Test
        @DisplayName("Two-step signup: POST /register issues challenge, POST /register/verify activates account")
        void shouldRegisterAndVerifyUserSuccessfully() throws Exception {
                RegisterRequest request = new RegisterRequest(
                                "john.doe@example.com",
                                "Password123!",
                                "John Doe",
                                "+919876543210",
                                "john_doe",
                                "SMS");

                // Step 1: Register -> returns challenge
                MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.verificationRequired", is(true)))
                                .andExpect(jsonPath("$.challengeId", notNullValue()))
                                .andExpect(jsonPath("$.maskedPhone", is("+91******3210")))
                                .andExpect(jsonPath("$.token").doesNotExist())
                                .andReturn();

                JsonNode regNode = objectMapper.readTree(regResult.getResponse().getContentAsString());
                String challengeId = regNode.get("challengeId").asText();
                String sentCode = devOtpDeliveryProvider.getLastSentCode();
                assertThat(sentCode).isNotNull().hasSize(6);

                // Step 2: Verify -> returns JWT and profile with 2FA backup codes
                OtpVerifyRequest verifyReq = new OtpVerifyRequest(challengeId, sentCode);
                mockMvc.perform(post("/api/v1/auth/register/verify")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(verifyReq)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.token", notNullValue()))
                                .andExpect(jsonPath("$.profile.email", is("john.doe@example.com")))
                                .andExpect(jsonPath("$.profile.displayName", is("John Doe")))
                                .andExpect(jsonPath("$.profile.username", is("john_doe")))
                                .andExpect(jsonPath("$.profile.phoneVerified", is(true)))
                                .andExpect(jsonPath("$.backupCodes", hasSize(10)));
        }

        @Test
        @DisplayName("POST /register rejects unsupported country code")
        void shouldRejectUnsupportedCountry() throws Exception {
                RegisterRequest request = new RegisterRequest(
                                "foreign@example.com",
                                "Password123!",
                                "Foreign User",
                                "+14155552671",
                                "foreign_user",
                                "SMS");

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().is(422))
                                .andExpect(jsonPath("$.code", is("PHONE_COUNTRY_NOT_SUPPORTED")));
        }

        @Test
        @DisplayName("POST /register rejects weak password")
        void shouldRejectWeakPassword() throws Exception {
                RegisterRequest request = new RegisterRequest(
                                "weak@example.com",
                                "lowercaseonly",
                                "Weak Pass User",
                                "+919876543211",
                                "weakuser");

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().is(422))
                                .andExpect(jsonPath("$.code", is("WEAK_PASSWORD")));
        }

        @Test
        @DisplayName("POST /register rejects duplicate email")
        void shouldRejectDuplicateEmail() throws Exception {
                RegisterRequest req1 = new RegisterRequest(
                                "duplicate.email@example.com",
                                "StrongPass123",
                                "User One",
                                "+919876543212",
                                "user_one");
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req1)))
                                .andExpect(status().isOk());

                RegisterRequest req2 = new RegisterRequest(
                                "DUPLICATE.EMAIL@example.com",
                                "StrongPass123",
                                "User Two",
                                "+919876543213",
                                "user_two");
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req2)))
                                .andExpect(status().is(422))
                                .andExpect(jsonPath("$.code", is("EMAIL_IN_USE")));
        }

        @Test
        @DisplayName("POST /register rejects duplicate username")
        void shouldRejectDuplicateUsername() throws Exception {
                RegisterRequest req1 = new RegisterRequest(
                                "user.a@example.com",
                                "StrongPass123",
                                "User A",
                                "+919876543214",
                                "unique_user");
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req1)))
                                .andExpect(status().isOk());

                RegisterRequest req2 = new RegisterRequest(
                                "user.b@example.com",
                                "StrongPass123",
                                "User B",
                                "+919876543215",
                                "UNIQUE_USER");
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req2)))
                                .andExpect(status().is(422))
                                .andExpect(jsonPath("$.code", is("USERNAME_IN_USE")));
        }

        @Test
        @DisplayName("Two-Factor Login: requires OTP, wrong OTP returns 422 (never 401), correct OTP returns token")
        void shouldPerformTwoFactorLogin() throws Exception {
                // Register and verify user
                String email = "twofa.user@example.com";
                String password = "Password123!";
                RegisterRequest regReq = new RegisterRequest(email, password, "TwoFA User", "+919876543220",
                                "twofa_user", "SMS");
                MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(regReq)))
                                .andExpect(status().isOk())
                                .andReturn();
                String regChallengeId = objectMapper.readTree(regRes.getResponse().getContentAsString())
                                .get("challengeId").asText();
                mockMvc.perform(post("/api/v1/auth/register/verify")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(new OtpVerifyRequest(regChallengeId,
                                                devOtpDeliveryProvider.getLastSentCode()))))
                                .andExpect(status().isOk());

                // Login Step 1: correct password triggers 2FA challenge
                LoginRequest loginReq = new LoginRequest(email, password);
                MvcResult loginRes = mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginReq)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.twoFactorRequired", is(true)))
                                .andExpect(jsonPath("$.challengeId", notNullValue()))
                                .andExpect(jsonPath("$.token").doesNotExist())
                                .andReturn();

                String twoFaChallengeId = objectMapper.readTree(loginRes.getResponse().getContentAsString())
                                .get("challengeId").asText();

                // Login Step 2a: Wrong OTP must return 422 (never 401!)
                TwoFactorVerifyRequest wrongOtp = new TwoFactorVerifyRequest(twoFaChallengeId, "000000", null);
                mockMvc.perform(post("/api/v1/auth/2fa/verify")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(wrongOtp)))
                                .andExpect(status().is(422))
                                .andExpect(jsonPath("$.code", is("OTP_INVALID")));

                // Login Step 2b: Correct OTP returns JWT
                String valid2faCode = devOtpDeliveryProvider.getLastSentCode();
                TwoFactorVerifyRequest correctOtp = new TwoFactorVerifyRequest(twoFaChallengeId, valid2faCode, null);
                mockMvc.perform(post("/api/v1/auth/2fa/verify")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(correctOtp)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.token", notNullValue()))
                                .andExpect(jsonPath("$.profile.email", is(email)));
        }

        @Test
        @DisplayName("2FA login with one-time backup code succeeds, and backup code cannot be reused")
        void shouldLoginWithBackupCodeAndPreventReuse() throws Exception {
                String email = "backup.user@example.com";
                String password = "Password123!";
                RegisterRequest regReq = new RegisterRequest(email, password, "Backup User", "+919876543230",
                                "backup_user", "SMS");
                MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(regReq)))
                                .andExpect(status().isOk())
                                .andReturn();
                String regChallengeId = objectMapper.readTree(regRes.getResponse().getContentAsString())
                                .get("challengeId").asText();
                MvcResult verifyRes = mockMvc.perform(post("/api/v1/auth/register/verify")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(new OtpVerifyRequest(regChallengeId,
                                                devOtpDeliveryProvider.getLastSentCode()))))
                                .andExpect(status().isOk())
                                .andReturn();

                JsonNode backupCodesArray = objectMapper.readTree(verifyRes.getResponse().getContentAsString())
                                .get("backupCodes");
                String firstBackupCode = backupCodesArray.get(0).asText();

                // Initiate 2FA Login
                MvcResult loginRes = mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
                                .andExpect(status().isOk())
                                .andReturn();
                String challengeId1 = objectMapper.readTree(loginRes.getResponse().getContentAsString())
                                .get("challengeId").asText();

                // Use backup code
                mockMvc.perform(post("/api/v1/auth/2fa/verify")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(
                                                new TwoFactorVerifyRequest(challengeId1, null, firstBackupCode))))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.token", notNullValue()));

                // Second login attempt reusing same backup code must fail with 422
                MvcResult loginRes2 = mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
                                .andExpect(status().isOk())
                                .andReturn();
                String challengeId2 = objectMapper.readTree(loginRes2.getResponse().getContentAsString())
                                .get("challengeId").asText();

                mockMvc.perform(post("/api/v1/auth/2fa/verify")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(
                                                new TwoFactorVerifyRequest(challengeId2, null, firstBackupCode))))
                                .andExpect(status().is(422))
                                .andExpect(jsonPath("$.code", is("BACKUP_CODE_INVALID")));
        }

        @Test
        @DisplayName("Legacy users without 2FA can log in immediately with JWT")
        void shouldAllowLegacyUserToLoginWithoutTwoFactor() throws Exception {
                UserEntity legacy = new UserEntity(
                                "legacy.user@example.com",
                                passwordEncoder.encode("Password123!"),
                                "Legacy User",
                                null,
                                null,
                                false,
                                null,
                                false,
                                "ACTIVE",
                                "legacy_user");
                userRepository.save(legacy);

                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper
                                                .writeValueAsString(new LoginRequest("legacy_user", "Password123!"))))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.token", notNullValue()))
                                .andExpect(jsonPath("$.twoFactorRequired", is(false)));
        }

        @Test
        @DisplayName("Unverified account login is blocked with 422 PHONE_NOT_VERIFIED")
        void shouldBlockUnverifiedAccountLogin() throws Exception {
                RegisterRequest regReq = new RegisterRequest("unverified@example.com", "Password123!", "Unverified",
                                "+919876543240", "unverified_u", "SMS");
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(regReq)))
                                .andExpect(status().isOk());

                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(
                                                new LoginRequest("unverified@example.com", "Password123!"))))
                                .andExpect(status().is(422))
                                .andExpect(jsonPath("$.code", is("PHONE_NOT_VERIFIED")));
        }

        @Test
        @DisplayName("Regression test: Challenge ID cannot be used as Bearer token to bypass 2FA")
        void challengeIdCannotBeUsedAsBearerToken() throws Exception {
                RegisterRequest regReq = new RegisterRequest("bearer.test@example.com", "Password123!", "Bearer Test",
                                "+919876543250", "bearer_tester", "SMS");
                MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(regReq)))
                                .andExpect(status().isOk())
                                .andReturn();
                String challengeId = objectMapper.readTree(regRes.getResponse().getContentAsString()).get("challengeId")
                                .asText();

                // Attempting to use challengeId as Bearer token on /api/v1/auth/profile must
                // return 401 UNAUTHORIZED
                mockMvc.perform(get("/api/v1/auth/profile")
                                .header("Authorization", "Bearer " + challengeId))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.code", is("UNAUTHORIZED")));
        }
}
