package com.infinance.glossary.service;

import com.infinance.glossary.dto.GlossaryTermDto;
import com.infinance.glossary.entity.GlossaryTermEntity;
import com.infinance.glossary.repository.GlossaryTermRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class GlossaryService {

    private final GlossaryTermRepository repository;

    public GlossaryService(GlossaryTermRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<GlossaryTermDto> getAllTerms() {
        return repository.findAllByOrderByTermAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public GlossaryTermDto getTerm(String term) {
        return repository.findByTermIgnoreCase(term)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Glossary term not found: " + term));
    }

    private GlossaryTermDto toDto(GlossaryTermEntity e) {
        return new GlossaryTermDto(
                e.getId(),
                e.getTerm(),
                e.getShortDefinition(),
                e.getDetailedExplainer(),
                e.getCategory(),
                e.getRelatedUrl()
        );
    }
}
