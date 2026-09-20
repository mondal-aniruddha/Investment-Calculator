package com.infinance.investing.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinance.investing.dto.SipRequestDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InvestingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("POST /api/v1/investing/sip should calculate SIP and return 200 OK")
    void shouldCalculateSipSuccessfully() throws Exception {
        SipRequestDto request = SipRequestDto.builder()
                .monthlyInvestment(new BigDecimal("10000.00"))
                .investmentHorizonYears(10)
                .expectedAnnualReturn(new BigDecimal("12.00"))
                .annualStepUpPercent(BigDecimal.ZERO)
                .riskProfile("MODERATE")
                .build();

        mockMvc.perform(post("/api/v1/investing/sip")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalInvested", is(1200000.00)))
                .andExpect(jsonPath("$.maturityCorpus", is(2323390.76)))
                .andExpect(jsonPath("$.totalInvestedFormatted.formattedInr", is("₹12,00,000")))
                .andExpect(jsonPath("$.maturityCorpusFormatted.formattedInr", is("₹23,23,391")))
                .andExpect(jsonPath("$.assumptions.financialYear", is("2024-2025")));
    }

    @Test
    @DisplayName("POST /api/v1/investing/sip should fail validation when monthly amount is under ₹100")
    void shouldFailValidationWhenSipUnderMin() throws Exception {
        SipRequestDto request = SipRequestDto.builder()
                .monthlyInvestment(new BigDecimal("50.00")) // Min is 100
                .investmentHorizonYears(10)
                .build();

        mockMvc.perform(post("/api/v1/investing/sip")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("VALIDATION_FAILED")))
                .andExpect(jsonPath("$.fieldErrors[0].field", is("monthlyInvestment")))
                .andExpect(jsonPath("$.fieldErrors[0].message", containsString("at least ₹100")));
    }
}
