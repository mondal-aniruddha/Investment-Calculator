package com.infinance.healthscore.dto;
import com.infinance.common.dto.BaseAssumptionsDto;
import java.util.List;
public record HealthScoreResponse(int score, String band, List<String> topImprovements, BaseAssumptionsDto assumptions) {}
