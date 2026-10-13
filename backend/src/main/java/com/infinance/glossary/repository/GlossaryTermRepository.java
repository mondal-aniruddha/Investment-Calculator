package com.infinance.glossary.repository;

import com.infinance.glossary.entity.GlossaryTermEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GlossaryTermRepository extends JpaRepository<GlossaryTermEntity, String> {

    Optional<GlossaryTermEntity> findByTermIgnoreCase(String term);

    List<GlossaryTermEntity> findAllByOrderByTermAsc();
}
