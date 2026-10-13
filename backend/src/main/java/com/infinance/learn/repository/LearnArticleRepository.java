package com.infinance.learn.repository;

import com.infinance.learn.entity.LearnArticleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearnArticleRepository extends JpaRepository<LearnArticleEntity, String> {

    Optional<LearnArticleEntity> findBySlug(String slug);

    List<LearnArticleEntity> findByCategoryIgnoreCaseOrderByCreatedAtDesc(String category);

    @Query("SELECT a FROM LearnArticleEntity a WHERE " +
           "(:category IS NULL OR LOWER(a.category) = LOWER(:category)) AND " +
           "(:query IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(a.excerpt) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(a.tags) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY a.createdAt ASC")
    List<LearnArticleEntity> searchArticles(@Param("category") String category, @Param("query") String query);
}
