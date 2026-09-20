package com.infinance.retirement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinance.retirement.dto.RetirementRequestDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RetirementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("POST /api/v1/retirement/plan should compute retirement corpus and trajectory")
    void shouldCalculateRetirementPlan() throws Exception {
        RetirementRequestDto request = RetirementRequestDto.builder()
                .currentAge(30)
                .targetRetirementAge(60)
                .lifeExpectancy(85)
                .currentMonthlyExpenses(new BigDecimal("50000.00"))
                .existingRetirementCorpus(new BigDecimal("1000000.00"))
                .currentMonthlyContribution(new BigDecimal("15000.00"))
                .expectedReturnPreRetirement(new BigDecimal("12.00"))
                .expectedReturnPostRetirement(new BigDecimal("7.00"))
                .expectedInflationRate(new BigDecimal("6.00"))
                .annualStepUpPercent(new BigDecimal("5.00"))
                .build();

        mockMvc.perform(post("/api/v1/retirement/plan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.yearsToRetirement", is(30)))
                .andExpect(jsonPath("$.retirementDurationYears", is(25)))
                .andExpect(jsonPath("$.monthlyExpenseAtRetirementFormatted.formattedInr").exists())
                .andExpect(jsonPath("$.requiredCorpusFormatted.formattedInr").exists())
                .andExpect(jsonPath("$.ageTrajectory").isArray())
                .andExpect(jsonPath("$.whatIfScenarios").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/retirement/plan should reject invalid age when currentAge >= retirementAge")
    void shouldRejectInvalidRetirementAge() throws Exception {
        RetirementRequestDto request = RetirementRequestDto.builder()
                .currentAge(45)
                .targetRetirementAge(40) // invalid
                .currentMonthlyExpenses(new BigDecimal("50000.00"))
                .build();

        mockMvc.perform(post("/api/v1/retirement/plan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.code", is("RETIREMENT_AGE_INVALID")));
    }
}
