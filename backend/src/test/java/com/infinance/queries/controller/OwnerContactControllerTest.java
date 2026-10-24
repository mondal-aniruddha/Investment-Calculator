package com.infinance.queries.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class OwnerContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // ── Legacy /owner-contact endpoint ────────────────────────────────────────

    @Test
    void getOwnerContact_returnsFounderDetails() throws Exception {
        mockMvc.perform(get("/api/v1/config/owner-contact").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Aniruddha Mondal"))
                .andExpect(jsonPath("$.whatsapp").isNotEmpty())
                .andExpect(jsonPath("$.email").value("aniruddha0266@gmail.com"));
    }

    // ── New /team endpoint ─────────────────────────────────────────────────────

    @Test
    void getTeam_returnsTwoMembers() throws Exception {
        mockMvc.perform(get("/api/v1/config/team").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    void getTeam_founderIsFirstWithCorrectFields() throws Exception {
        mockMvc.perform(get("/api/v1/config/team").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("aniruddha"))
                .andExpect(jsonPath("$[0].name").value("Aniruddha Mondal"))
                .andExpect(jsonPath("$[0].role").value("Founder & Lead Developer"))
                .andExpect(jsonPath("$[0].whatsapp").isNotEmpty())
                .andExpect(jsonPath("$[0].email").value("aniruddha0266@gmail.com"))
                .andExpect(jsonPath("$[0].initials").value("AM"))
                .andExpect(jsonPath("$[0].shortBio").isNotEmpty());
    }

    @Test
    void getTeam_coFounderIsSecondWithCorrectFields() throws Exception {
        mockMvc.perform(get("/api/v1/config/team").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[1].id").value("kuhika"))
                .andExpect(jsonPath("$[1].name").value("Kuhika Das"))
                .andExpect(jsonPath("$[1].role").value("Co-founder & Process Engineer"))
                .andExpect(jsonPath("$[1].shortBio", startsWith("Kuhika is a Process Engineer")))
                .andExpect(jsonPath("$[1].shortBio", not(containsString("placeholder"))))
                .andExpect(jsonPath("$[1].shortBio", not(containsString("<"))))
                .andExpect(jsonPath("$[1].whatsapp").isNotEmpty())
                .andExpect(jsonPath("$[1].email").value("kuhika.das@gmail.com"))
                .andExpect(jsonPath("$[1].initials").value("KD"));
    }

    @Test
    void getTeam_whatsappContainsNoTelLink() throws Exception {
        // Verifies no tel: scheme is inadvertently exposed via the API
        mockMvc.perform(get("/api/v1/config/team").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].whatsapp", not(startsWith("tel:"))))
                .andExpect(jsonPath("$[1].whatsapp", not(startsWith("tel:"))));
    }
}
