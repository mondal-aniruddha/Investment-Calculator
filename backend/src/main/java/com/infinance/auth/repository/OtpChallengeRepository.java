package com.infinance.auth.repository;

import com.infinance.auth.entity.OtpChallengeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OtpChallengeRepository extends JpaRepository<OtpChallengeEntity, String> {
    void deleteByUserId(String userId);
    void deleteByExpiresAtBefore(Instant threshold);
    long countByDestinationE164AndLastSentAtAfter(String destinationE164, Instant threshold);
    List<OtpChallengeEntity> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<OtpChallengeEntity> findTopByUserIdAndPurposeOrderByCreatedAtDesc(String userId, String purpose);
}

