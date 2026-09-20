package com.infinance.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinance.auth.dto.AuthDtos.*;
import com.infinance.auth.repository.SavedScenarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScenarioServiceTest {
    @Mock SavedScenarioRepository repository;
    @Mock AuthService auth;

    @Test
    void rejectsComparingScenarioNotOwnedByUser() {
        ScenarioService service = new ScenarioService(repository, auth, new ObjectMapper());
        when(repository.findByIdAndUserId("missing", "user")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.compare("user", new CompareRequest(java.util.List.of("missing", "other"))));
    }
}
