package com.infinance.learn.controller;

import com.infinance.learn.dto.ArticleDetailDto;
import com.infinance.learn.dto.ArticleSummaryDto;
import com.infinance.learn.service.LearnArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/learn")
@Tag(name = "Learn Hub", description = "Plain-language, jargon-free personal finance articles and starter explainers for India")
public class LearnArticleController {

    private final LearnArticleService service;

    public LearnArticleController(LearnArticleService service) {
        this.service = service;
    }

    @GetMapping("/articles")
    @Operation(summary = "List learning articles", description = "Get articles filtered by category (Basics, Investing, Tax, Credit, Insurance, Retirement) or search query.")
    public ResponseEntity<List<ArticleSummaryDto>> getArticles(
            @Parameter(description = "Category filter (optional)") @RequestParam(required = false) String category,
            @Parameter(description = "Search query (optional)") @RequestParam(required = false) String query) {
        return ResponseEntity.ok(service.getArticles(category, query));
    }

    @GetMapping("/articles/{slug}")
    @Operation(summary = "Get article by slug", description = "Returns complete article details including full Markdown body and source references.")
    public ResponseEntity<ArticleDetailDto> getArticleBySlug(
            @Parameter(description = "Article slug") @PathVariable String slug) {
        return ResponseEntity.ok(service.getArticleBySlug(slug));
    }
}
