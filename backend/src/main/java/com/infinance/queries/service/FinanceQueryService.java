package com.infinance.queries.service;

import com.infinance.common.exception.InvalidFinancialInputException;
import com.infinance.queries.dto.CreateQueryRequest;
import com.infinance.queries.dto.QueryDetailDto;
import com.infinance.queries.dto.QuerySubmissionResponse;
import com.infinance.queries.dto.UpdateQueryStatusRequest;
import com.infinance.queries.entity.FinanceQuery;
import com.infinance.queries.entity.QueryCategory;
import com.infinance.queries.entity.QueryStatus;
import com.infinance.queries.repository.FinanceQueryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Year;
import java.util.Locale;

@Service
public class FinanceQueryService {

    private static final Logger log = LoggerFactory.getLogger(FinanceQueryService.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final FinanceQueryRepository repository;
    private final QueryNotificationService notificationService;

    public FinanceQueryService(FinanceQueryRepository repository,
                               QueryNotificationService notificationService) {
        this.repository = repository;
        this.notificationService = notificationService;
    }

    @Transactional
    public QuerySubmissionResponse submitQuery(CreateQueryRequest request, String clientIp) {
        // 1. Honeypot check
        if (request.honeypot() != null && !request.honeypot().isBlank()) {
            log.warn("Rejected spam query submission: honeypot field was populated");
            throw new InvalidFinancialInputException("SPAM_DETECTED", "Spam submission detected");
        }

        // 2. Sanitize free-text fields to prevent stored XSS
        String sanitizedName = sanitize(request.name());
        String sanitizedSubject = sanitize(request.subject());
        String sanitizedMessage = sanitize(request.message());
        String cleanWhatsapp = (request.whatsapp() != null && !request.whatsapp().isBlank()) ? request.whatsapp().trim() : null;

        // 3. Hash client IP (do not store raw IP)
        String ipHash = hashIp(clientIp);

        // 4. Generate unique human-readable reference ID (e.g. FQ-2026-X8K9M2)
        String referenceId = generateReferenceId();

        // 5. Create and persist entity
        FinanceQuery query = new FinanceQuery(
                referenceId,
                sanitizedName,
                request.email().trim().toLowerCase(Locale.ROOT),
                cleanWhatsapp,
                request.category(),
                sanitizedSubject,
                sanitizedMessage,
                request.preferredContact(),
                ipHash
        );

        FinanceQuery saved = repository.save(query);

        // Security requirement: never log message body or contact number
        log.info("Saved new finance query referenceId={} category={}", referenceId, request.category());

        // 6. Optional email notification
        notificationService.notifyOwner(saved);

        return new QuerySubmissionResponse(
                referenceId,
                "Your query has been submitted successfully. Reference ID: " + referenceId
        );
    }

    @Transactional(readOnly = true)
    public Page<QueryDetailDto> getQueries(QueryStatus status, QueryCategory category, Pageable pageable) {
        Page<FinanceQuery> page;
        if (status != null && category != null) {
            page = repository.findByStatusAndCategory(status, category, pageable);
        } else if (status != null) {
            page = repository.findByStatus(status, pageable);
        } else if (category != null) {
            page = repository.findByCategory(category, pageable);
        } else {
            page = repository.findAll(pageable);
        }
        return page.map(QueryDetailDto::fromEntity);
    }

    @Transactional
    public QueryDetailDto updateStatus(String id, UpdateQueryStatusRequest request) {
        FinanceQuery query = repository.findById(id)
                .orElseThrow(() -> new InvalidFinancialInputException("QUERY_NOT_FOUND", "Finance query not found with id: " + id));

        query.setStatus(request.status());
        FinanceQuery updated = repository.save(query);
        log.info("Updated finance query id={} referenceId={} status={}", id, query.getReferenceId(), request.status());
        return QueryDetailDto.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public QueryDetailDto getByReferenceId(String referenceId) {
        FinanceQuery query = repository.findByReferenceId(referenceId)
                .orElseThrow(() -> new InvalidFinancialInputException("QUERY_NOT_FOUND", "Finance query not found with reference ID: " + referenceId));
        return QueryDetailDto.fromEntity(query);
    }

    private String generateReferenceId() {
        int currentYear = Year.now().getValue();
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder("FQ-").append(currentYear).append("-");
            for (int i = 0; i < 6; i++) {
                sb.append(ALPHANUM.charAt(RANDOM.nextInt(ALPHANUM.length())));
            }
            String candidate = sb.toString();
            if (repository.findByReferenceId(candidate).isEmpty()) {
                return candidate;
            }
        }
        // Fallback
        return "FQ-" + currentYear + "-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);
    }

    private String sanitize(String input) {
        if (input == null) return null;
        return input.replaceAll("<[^>]*>", "").trim();
    }

    private String hashIp(String ip) {
        if (ip == null || ip.isBlank()) {
            return "unknown";
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(ip.trim().getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return Integer.toHexString(ip.hashCode());
        }
    }
}
