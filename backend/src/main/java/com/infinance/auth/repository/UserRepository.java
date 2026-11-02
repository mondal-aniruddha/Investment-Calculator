package com.infinance.auth.repository;

import com.infinance.auth.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, String> {
    Optional<UserEntity> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    Optional<UserEntity> findByUsernameIgnoreCase(String username);
    boolean existsByUsernameIgnoreCase(String username);
    Optional<UserEntity> findByEmailIgnoreCaseOrUsernameIgnoreCase(String email, String username);
    boolean existsByPhoneE164(String phoneE164);
    Optional<UserEntity> findByPhoneE164(String phoneE164);
    List<UserEntity> findByStatusAndCreatedAtBefore(String status, Instant threshold);
    void deleteByStatusAndCreatedAtBefore(String status, Instant threshold);
}
