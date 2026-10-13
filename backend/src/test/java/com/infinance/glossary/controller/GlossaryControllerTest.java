package com.infinance.glossary.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class GlossaryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/glossary should return list of financial terms")
    void shouldReturnAllGlossaryTerms() throws Exception {
        mockMvc.perform(get("/api/v1/glossary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(15))))
                .andExpect(jsonPath("$[?(@.term == 'CAGR')].shortDefinition").exists())
                .andExpect(jsonPath("$[?(@.term == 'XIRR')].shortDefinition").exists())
                .andExpect(jsonPath("$[?(@.term == 'SIP')].shortDefinition").exists());
    }

    @Test
    @DisplayName("GET /api/v1/glossary/CAGR should return single term definition")
    void shouldReturnSingleTerm() throws Exception {
        mockMvc.perform(get("/api/v1/glossary/CAGR")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.term", is("CAGR")))
                .andExpect(jsonPath("$.shortDefinition", containsString("Compound Annual Growth Rate")));
    }
}
