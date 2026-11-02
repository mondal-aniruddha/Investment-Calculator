package com.infinance.auth.repository;

import com.infinance.auth.entity.AuthAuditEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuthAuditEventRepository extends JpaRepository<AuthAuditEventEntity, String> {
    List<AuthAuditEventEntity> findByUserIdOrderByCreatedAtDesc(String userId);
    void deleteByUserId(String userId);
}

