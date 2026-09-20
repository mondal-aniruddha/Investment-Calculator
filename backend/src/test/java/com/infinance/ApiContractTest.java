package com.infinance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinance.investing.dto.SipRequestDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiContractTest {

    @Autowired MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void sipContractContainsProjectionAndAssumptions() throws Exception {
        SipRequestDto request = SipRequestDto.builder()
                .monthlyInvestment(new BigDecimal("1000"))
                .investmentHorizonYears(3)
                .expectedAnnualReturn(new BigDecimal("10"))
                .annualStepUpPercent(BigDecimal.ZERO)
                .riskProfile("MODERATE")
                .build();

        mockMvc.perform(post("/api/v1/investing/sip")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalInvested").isNumber())
                .andExpect(jsonPath("$.maturityCorpus").isNumber())
                .andExpect(jsonPath("$.estimatedReturns").isNumber())
                .andExpect(jsonPath("$.yearlyBreakdown", hasSize(3)))
                .andExpect(jsonPath("$.assumptions.financialYear").isString());
    }

    @Test
    void taxSlabsContractReturnsConfiguredRegimes() throws Exception {
        mockMvc.perform(get("/api/v1/tax/slabs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.newRegime", hasSize(6)))
                .andExpect(jsonPath("$.oldRegime").isArray())
                .andExpect(jsonPath("$.newRegime[0].ratePercent").isNumber())
                .andExpect(jsonPath("$.oldRegime[0].displayRange").isString());
    }

    @Test
    void invalidSipContractUsesStructuredValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/investing/sip")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"monthlyInvestment\":50,\"investmentHorizonYears\":3}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("VALIDATION_FAILED")))
                .andExpect(jsonPath("$.fieldErrors").isArray());
    }
}
