package com.infinance.common.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CorsPropertiesTest {

    @Test
    @DisplayName("CorsProperties initializes with sensible local development defaults")
    void defaultsArePopulated() {
        CorsProperties properties = new CorsProperties();

        assertThat(properties.getAllowedOrigins())
                .isNotNull()
                .isNotEmpty()
                .contains("http://localhost:5173", "http://127.0.0.1:5173");
    }

    @Test
    @DisplayName("CorsProperties allows overriding allowed origins")
    void canSetAllowedOrigins() {
        CorsProperties properties = new CorsProperties();
        properties.setAllowedOrigins(List.of("https://custom.domain.com"));

        assertThat(properties.getAllowedOrigins())
                .containsExactly("https://custom.domain.com");
    }
}
