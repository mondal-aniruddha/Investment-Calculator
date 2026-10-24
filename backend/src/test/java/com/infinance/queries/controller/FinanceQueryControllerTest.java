package com.infinance.queries.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinance.queries.dto.CreateQueryRequest;
import com.infinance.queries.dto.UpdateQueryStatusRequest;
import com.infinance.queries.entity.PreferredContactMethod;
import com.infinance.queries.entity.QueryCategory;
import com.infinance.queries.entity.QueryStatus;
import com.infinance.queries.security.QueryRateLimitFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class FinanceQueryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private QueryRateLimitFilter queryRateLimitFilter;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        queryRateLimitFilter.reset();
    }

    @Test
    @DisplayName("POST /api/v1/queries should succeed with valid data and return 201 with referenceId")
    void shouldSubmitQuerySuccessfully() throws Exception {
        CreateQueryRequest request = new CreateQueryRequest(
                "Rahul Sharma",
                "rahul.sharma@example.com",
                "+919876543210",
                QueryCategory.SIP_MUTUAL_FUNDS,
                "Query about Index Funds SIP",
                "I want to understand whether Nifty 50 or Nifty Next 50 is better for a 15-year horizon.",
                PreferredContactMethod.EMAIL,
                true,
                null
        );

        mockMvc.perform(post("/api/v1/queries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.referenceId", notNullValue()))
                .andExpect(jsonPath("$.referenceId", startsWith("FQ-")))
                .andExpect(jsonPath("$.message", containsString("FQ-")));
    }

    @Test
    @DisplayName("POST /api/v1/queries should fail with 400 when validation fails")
    void shouldFailValidationOnInvalidInput() throws Exception {
        CreateQueryRequest invalidRequest = new CreateQueryRequest(
                "A", // Too short (min 2)
                "invalid-email", // Bad email
                "123", // Bad phone format
                null, // Missing category
                "Hi", // Too short (min 5)
                "Short msg", // Too short (min 20)
                null, // Missing preferredContact
                false, // Consent must be true
                null
        );

        mockMvc.perform(post("/api/v1/queries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("VALIDATION_FAILED")))
                .andExpect(jsonPath("$.fieldErrors", not(empty())));
    }

    @Test
    @DisplayName("POST /api/v1/queries should reject spam when honeypot is populated")
    void shouldRejectSpamWhenHoneypotPopulated() throws Exception {
        CreateQueryRequest spamRequest = new CreateQueryRequest(
                "Spammer",
                "spam@example.com",
                null,
                QueryCategory.OTHER,
                "Promotional offer for crypto",
                "This is spam message content that has more than twenty characters.",
                PreferredContactMethod.EMAIL,
                true,
                "I am a spam bot"
        );

        mockMvc.perform(post("/api/v1/queries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(spamRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("SPAM_DETECTED")));
    }

    @Test
    @DisplayName("POST /api/v1/queries should trigger 429 when rate limit of 5 submissions is exceeded")
    void shouldRateLimitExceededSubmissions() throws Exception {
        CreateQueryRequest request = new CreateQueryRequest(
                "Ankit Verma",
                "ankit.verma@example.com",
                null,
                QueryCategory.RETIREMENT_PLANNING,
                "Retirement corpus query",
                "How much monthly savings do I need to achieve 5 crore corpus in 25 years?",
                PreferredContactMethod.EITHER,
                true,
                null
        );

        String json = objectMapper.writeValueAsString(request);

        // Submit 5 valid requests with same IP
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/v1/queries")
                            .with(req -> {
                                req.setRemoteAddr("198.51.100.25");
                                return req;
                            })
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json))
                    .andExpect(status().isCreated());
        }

        // 6th request from same IP should get 429
        mockMvc.perform(post("/api/v1/queries")
                        .with(req -> {
                            req.setRemoteAddr("198.51.100.25");
                            return req;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", "3600"))
                .andExpect(jsonPath("$.code", is("RATE_LIMIT_EXCEEDED")));
    }

    @Test
    @DisplayName("GET /api/v1/config/owner-contact should be public and return owner details")
    void shouldGetOwnerContactPublicly() throws Exception {
        mockMvc.perform(get("/api/v1/config/owner-contact"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Aniruddha Mondal")))
                .andExpect(jsonPath("$.whatsapp", is("+91 8013292565")))
                .andExpect(jsonPath("$.email", is("aniruddha0266@gmail.com")));
    }

    @Test
    @DisplayName("GET /api/v1/admin/queries should require ADMIN credentials (401/403 without auth, 200 with basic auth)")
    void shouldEnforceAdminAccessForQueries() throws Exception {
        // Without auth -> 401
        mockMvc.perform(get("/api/v1/admin/queries"))
                .andExpect(status().isUnauthorized());

        // With admin HTTP basic auth -> 200
        mockMvc.perform(get("/api/v1/admin/queries")
                        .header("Authorization", basicAuth("admin", "change-me")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()));
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/queries/{id}/status should require ADMIN credentials")
    void shouldEnforceAdminAccessForStatusUpdate() throws Exception {
        // First submit a query
        CreateQueryRequest request = new CreateQueryRequest(
                "Sneha Roy",
                "sneha@example.com",
                null,
                QueryCategory.INCOME_TAX,
                "Section 80C deductions",
                "Can I claim PPF and ELSS under 80C simultaneously up to 1.5 lakhs?",
                PreferredContactMethod.EMAIL,
                true,
                null
        );

        mockMvc.perform(post("/api/v1/queries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Now list queries as admin to get an id
        String responseContent = mockMvc.perform(get("/api/v1/admin/queries")
                        .header("Authorization", basicAuth("admin", "change-me")))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(responseContent).path("content").get(0).path("id").asText();

        // Update status without auth -> 401
        mockMvc.perform(patch("/api/v1/admin/queries/" + id + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateQueryStatusRequest(QueryStatus.IN_PROGRESS))))
                .andExpect(status().isUnauthorized());

        // Update status with admin auth -> 200
        mockMvc.perform(patch("/api/v1/admin/queries/" + id + "/status")
                        .header("Authorization", basicAuth("admin", "change-me"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateQueryStatusRequest(QueryStatus.IN_PROGRESS))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("IN_PROGRESS")));
    }

    private String basicAuth(String username, String password) {
        String token = username + ":" + password;
        return "Basic " + Base64.getEncoder().encodeToString(token.getBytes(StandardCharsets.UTF_8));
    }
}
