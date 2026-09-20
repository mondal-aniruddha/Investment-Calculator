package com.infinance.auth.repository;
import com.infinance.auth.entity.SavedScenarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface SavedScenarioRepository extends JpaRepository<SavedScenarioEntity, String> {
    List<SavedScenarioEntity> findAllByUserIdOrderByUpdatedAtDesc(String userId);
    Optional<SavedScenarioEntity> findByIdAndUserId(String id, String userId);
    long deleteByUserId(String userId);
}
