package com.infinance.tax.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinance.tax.dto.TaxCalculationRequestDto;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TaxControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("POST /api/v1/tax/calculate should calculate and compare Old vs New regime")
    void shouldCalculateTaxComparingRegimes() throws Exception {
        TaxCalculationRequestDto request = TaxCalculationRequestDto.builder()
                .grossSalary(new BigDecimal("1200000.00"))
                .incomeFromOtherSources(new BigDecimal("50000.00"))
                .section80C(new BigDecimal("150000.00"))
                .section80DMedicalInsurance(new BigDecimal("25000.00"))
                .financialYear("2024-2025")
                .build();

        mockMvc.perform(post("/api/v1/tax/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.financialYear", is("2024-2025")))
                .andExpect(jsonPath("$.newRegime.regimeName", is("NEW")))
                .andExpect(jsonPath("$.oldRegime.regimeName", is("OLD")))
                .andExpect(jsonPath("$.recommendedRegime").exists())
                .andExpect(jsonPath("$.summaryMessage").exists());
    }

    @Test
    @DisplayName("GET /api/v1/tax/slabs should return configured slabs for New and Old regime")
    void shouldFetchTaxSlabs() throws Exception {
        mockMvc.perform(get("/api/v1/tax/slabs?fy=2024-2025"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.newRegime").isArray())
                .andExpect(jsonPath("$.oldRegime").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/tax/calculate should fail when salary is negative")
    void shouldFailWhenSalaryNegative() throws Exception {
        TaxCalculationRequestDto request = TaxCalculationRequestDto.builder()
                .grossSalary(new BigDecimal("-1000.00"))
                .build();

        mockMvc.perform(post("/api/v1/tax/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("VALIDATION_FAILED")))
                .andExpect(jsonPath("$.fieldErrors[0].field", is("grossSalary")))
                .andExpect(jsonPath("$.fieldErrors[0].message", containsString("cannot be negative")));
    }
}
