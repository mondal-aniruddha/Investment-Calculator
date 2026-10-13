package com.infinance.learn.service;

import com.infinance.learn.dto.ArticleDetailDto;
import com.infinance.learn.dto.ArticleSummaryDto;
import com.infinance.learn.entity.LearnArticleEntity;
import com.infinance.learn.repository.LearnArticleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class LearnArticleService {

    private final LearnArticleRepository repository;

    public LearnArticleService(LearnArticleRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ArticleSummaryDto> getArticles(String category, String query) {
        String cleanCategory = (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL"))
                ? category.trim() : null;
        String cleanQuery = (query != null && !query.isBlank()) ? query.trim() : null;

        List<LearnArticleEntity> entities = repository.searchArticles(cleanCategory, cleanQuery);
        return entities.stream().map(this::toSummaryDto).toList();
    }

    @Transactional(readOnly = true)
    public ArticleDetailDto getArticleBySlug(String slug) {
        return repository.findBySlug(slug)
                .map(this::toDetailDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found with slug: " + slug));
    }

    private ArticleSummaryDto toSummaryDto(LearnArticleEntity e) {
        return new ArticleSummaryDto(
                e.getId(),
                e.getSlug(),
                e.getTitle(),
                e.getExcerpt(),
                e.getCategory(),
                e.getReadingTimeMinutes(),
                e.getRelatedCalculatorPath(),
                e.getRelatedCalculatorLabel(),
                e.getTags(),
                e.getUpdatedAt()
        );
    }

    private ArticleDetailDto toDetailDto(LearnArticleEntity e) {
        return new ArticleDetailDto(
                e.getId(),
                e.getSlug(),
                e.getTitle(),
                e.getExcerpt(),
                e.getCategory(),
                e.getBodyMarkdown(),
                e.getReadingTimeMinutes(),
                e.getRelatedCalculatorPath(),
                e.getRelatedCalculatorLabel(),
                e.getTags(),
                e.getSources(),
                e.getUpdatedAt(),
                e.getCreatedAt()
        );
    }
}
