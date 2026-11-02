package com.infinance.auth.repository;

import com.infinance.auth.entity.BackupCodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BackupCodeRepository extends JpaRepository<BackupCodeEntity, String> {
    List<BackupCodeEntity> findByUserIdAndUsedAtIsNull(String userId);
    long countByUserIdAndUsedAtIsNull(String userId);
    void deleteByUserId(String userId);
}

