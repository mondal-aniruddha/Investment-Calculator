package com.infinance.learn.controller;

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
class LearnArticleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/learn/articles should return list of seeded articles")
    void shouldReturnArticles() throws Exception {
        mockMvc.perform(get("/api/v1/learn/articles")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(15))))
                .andExpect(jsonPath("$[0].slug").exists())
                .andExpect(jsonPath("$[0].title").exists())
                .andExpect(jsonPath("$[0].readingTimeMinutes").isNumber());
    }

    @Test
    @DisplayName("GET /api/v1/learn/articles?category=Investing should filter by category")
    void shouldFilterByCategory() throws Exception {
        mockMvc.perform(get("/api/v1/learn/articles")
                        .param("category", "Investing")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$[0].category", equalToIgnoringCase("Investing")));
    }

    @Test
    @DisplayName("GET /api/v1/learn/articles/what-is-sip should return detailed markdown article")
    void shouldReturnArticleBySlug() throws Exception {
        mockMvc.perform(get("/api/v1/learn/articles/what-is-sip")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug", is("what-is-sip")))
                .andExpect(jsonPath("$.title", containsString("SIP Explained")))
                .andExpect(jsonPath("$.bodyMarkdown", containsString("Systematic Investment Plan")))
                .andExpect(jsonPath("$.relatedCalculatorPath", is("/sip")));
    }

    @Test
    @DisplayName("GET /api/v1/learn/articles/non-existent-slug should return 404")
    void shouldReturn404ForUnknownSlug() throws Exception {
        mockMvc.perform(get("/api/v1/learn/articles/non-existent-slug")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
