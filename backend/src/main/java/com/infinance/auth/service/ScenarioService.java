package com.infinance.auth.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinance.auth.dto.AuthDtos.*;
import com.infinance.auth.entity.*;
import com.infinance.auth.repository.SavedScenarioRepository;
import com.infinance.common.exception.InvalidFinancialInputException;
import com.infinance.common.security.EncryptionService;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@Service
public class ScenarioService {
    private final SavedScenarioRepository scenarios; private final AuthService auth; private final EncryptionService encryption; private final JsonMapper mapper = JsonMapper.builder().findAndAddModules().build();
    @Autowired
    public ScenarioService(SavedScenarioRepository scenarios, AuthService auth, EncryptionService encryption) { this.scenarios=scenarios; this.auth=auth; this.encryption=encryption; }
    public ScenarioService(SavedScenarioRepository scenarios, AuthService auth, ObjectMapper ignored) { this.scenarios=scenarios; this.auth=auth; this.encryption=null; }
    public List<ScenarioResponse> list(String userId) { return scenarios.findAllByUserIdOrderByUpdatedAtDesc(userId).stream().map(this::toDto).toList(); }
    public ScenarioResponse create(String userId, ScenarioRequest r) { return toDto(scenarios.save(new SavedScenarioEntity(auth.find(userId),r.name().trim(),r.scenarioType().trim(),encrypt(json(r.payload()))))); }
    public ScenarioResponse update(String userId, String id, ScenarioRequest r) {
        SavedScenarioEntity s = owned(userId,id); s.update(r.name().trim(),r.scenarioType().trim(),encrypt(json(r.payload()))); return toDto(scenarios.save(s));
    }
    public void delete(String userId, String id) { scenarios.delete(owned(userId,id)); }
    public CompareResponse compare(String userId, CompareRequest r) {
        List<ScenarioResponse> result = r.scenarioIds().stream().distinct().map(id -> toDto(owned(userId,id))).toList();
        if (result.size() < 2) throw new InvalidFinancialInputException("SCENARIO_COMPARISON", "At least two distinct scenarios are required");
        return new CompareResponse(result);
    }
    private SavedScenarioEntity owned(String userId,String id) { return scenarios.findByIdAndUserId(id,userId).orElseThrow(() -> new InvalidFinancialInputException("SCENARIO_NOT_FOUND","Scenario not found")); }
    private String json(Object value) { try { return mapper.writeValueAsString(value); } catch (JsonProcessingException e) { throw new InvalidFinancialInputException("INVALID_SCENARIO","Scenario payload must be valid JSON"); } }
    private ScenarioResponse toDto(SavedScenarioEntity s) { try { return new ScenarioResponse(s.getId(),s.getName(),s.getScenarioType(),mapper.readTree(decrypt(s.getPayload())),s.getCreatedAt(),s.getUpdatedAt()); } catch (JsonProcessingException e) { throw new InvalidFinancialInputException("INVALID_SCENARIO","Stored scenario is invalid"); } }
    private String encrypt(String payload) { return encryption == null ? payload : encryption.encrypt(payload); }
    private String decrypt(String payload) { return encryption == null ? payload : encryption.decrypt(payload); }
}
