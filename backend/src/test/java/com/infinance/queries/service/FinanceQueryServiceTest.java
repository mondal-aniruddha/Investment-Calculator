package com.infinance.queries.service;

import com.infinance.common.exception.InvalidFinancialInputException;
import com.infinance.queries.dto.CreateQueryRequest;
import com.infinance.queries.dto.QueryDetailDto;
import com.infinance.queries.dto.QuerySubmissionResponse;
import com.infinance.queries.dto.UpdateQueryStatusRequest;
import com.infinance.queries.entity.FinanceQuery;
import com.infinance.queries.entity.PreferredContactMethod;
import com.infinance.queries.entity.QueryCategory;
import com.infinance.queries.entity.QueryStatus;
import com.infinance.queries.repository.FinanceQueryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinanceQueryServiceTest {

    @Mock
    private FinanceQueryRepository repository;

    @Mock
    private QueryNotificationService notificationService;

    private FinanceQueryService service;

    @BeforeEach
    void setUp() {
        service = new FinanceQueryService(repository, notificationService);
    }

    @Test
    @DisplayName("submitQuery should generate referenceId, hash IP, sanitize HTML, and save query")
    void shouldSubmitQuerySuccessfully() {
        CreateQueryRequest request = new CreateQueryRequest(
                "<b>John</b> Doe",
                "john@example.com",
                "+91 9876543210",
                QueryCategory.SIP_MUTUAL_FUNDS,
                "<script>alert('xss')</script>How to choose index funds?",
                "<p>I want to start an SIP of 10000 per month for retirement.</p>",
                PreferredContactMethod.EMAIL,
                true,
                null
        );

        when(repository.findByReferenceId(any())).thenReturn(Optional.empty());
        when(repository.save(any(FinanceQuery.class))).thenAnswer(invocation -> invocation.getArgument(0));

        QuerySubmissionResponse response = service.submitQuery(request, "192.168.1.1");

        assertThat(response).isNotNull();
        assertThat(response.referenceId()).startsWith("FQ-");
        assertThat(response.message()).contains(response.referenceId());

        ArgumentCaptor<FinanceQuery> captor = ArgumentCaptor.forClass(FinanceQuery.class);
        verify(repository).save(captor.capture());

        FinanceQuery saved = captor.getValue();
        assertThat(saved.getName()).isEqualTo("John Doe");
        assertThat(saved.getSubject()).isEqualTo("alert('xss')How to choose index funds?");
        assertThat(saved.getMessage()).isEqualTo("I want to start an SIP of 10000 per month for retirement.");
        assertThat(saved.getEmail()).isEqualTo("john@example.com");
        assertThat(saved.getWhatsapp()).isEqualTo("+91 9876543210");
        assertThat(saved.getCategory()).isEqualTo(QueryCategory.SIP_MUTUAL_FUNDS);
        assertThat(saved.getStatus()).isEqualTo(QueryStatus.NEW);
        assertThat(saved.getClientIpHash()).isNotEqualTo("192.168.1.1");
        assertThat(saved.getClientIpHash()).hasSize(64); // SHA-256 hex length

        verify(notificationService).notifyOwner(saved);
    }

    @Test
    @DisplayName("submitQuery should throw InvalidFinancialInputException when honeypot is filled")
    void shouldRejectSpamWhenHoneypotFilled() {
        CreateQueryRequest request = new CreateQueryRequest(
                "Bot User",
                "bot@example.com",
                null,
                QueryCategory.OTHER,
                "Buy Cheap Stocks",
                "Spam message content over twenty characters long.",
                PreferredContactMethod.EMAIL,
                true,
                "http://spam-link.com"
        );

        assertThatThrownBy(() -> service.submitQuery(request, "10.0.0.1"))
                .isInstanceOf(InvalidFinancialInputException.class)
                .hasMessageContaining("Spam submission detected");

        verify(repository, never()).save(any());
        verify(notificationService, never()).notifyOwner(any());
    }

    @Test
    @DisplayName("updateStatus should change query status and persist")
    void shouldUpdateQueryStatus() {
        FinanceQuery query = new FinanceQuery(
                "FQ-2026-ABC123",
                "Alice",
                "alice@example.com",
                null,
                QueryCategory.INCOME_TAX,
                "Old vs New Tax Regime",
                "Which tax regime is better for 15L salary?",
                PreferredContactMethod.EMAIL,
                "hash123"
        );

        when(repository.findById(query.getId())).thenReturn(Optional.of(query));
        when(repository.save(any(FinanceQuery.class))).thenAnswer(invocation -> invocation.getArgument(0));

        QueryDetailDto result = service.updateStatus(query.getId(), new UpdateQueryStatusRequest(QueryStatus.RESOLVED));

        assertThat(result.status()).isEqualTo(QueryStatus.RESOLVED);
        verify(repository).save(query);
    }

    @Test
    @DisplayName("getQueries should return paginated list of QueryDetailDto")
    void shouldGetQueriesPaginated() {
        FinanceQuery query = new FinanceQuery(
                "FQ-2026-ABC123",
                "Bob",
                "bob@example.com",
                null,
                QueryCategory.LOANS_EMI,
                "Home loan prepayment",
                "Should I prepay home loan or invest in SIP?",
                PreferredContactMethod.EITHER,
                "hash456"
        );

        when(repository.findByStatus(eq(QueryStatus.NEW), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(query)));

        Page<QueryDetailDto> page = service.getQueries(QueryStatus.NEW, null, PageRequest.of(0, 10));

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).referenceId()).isEqualTo("FQ-2026-ABC123");
        assertThat(page.getContent().get(0).categoryDisplayName()).isEqualTo("Loans / EMI");
    }
}
