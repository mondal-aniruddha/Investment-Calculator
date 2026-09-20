package com.infinance.reports.service;

import com.infinance.common.dto.BaseAssumptionsDto;
import com.infinance.reports.dto.PersonalizedReportRequest;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ReportExportServiceTest {

    private final ReportExportService service = new ReportExportService();
    private final PersonalizedReportRequest request = new PersonalizedReportRequest(
            "My financial plan",
            "Asha",
            Map.of("sip", Map.of("maturityCorpus", new BigDecimal("1250000"))),
            new BaseAssumptionsDto("2024-2025", new BigDecimal("6"), new BigDecimal("12"),
                    new BigDecimal("7"), "For illustration only", Map.of()));

    @Test
    void exportsPdf() {
        byte[] report = service.exportPdf(request);

        assertTrue(report.length > 100);
        assertArrayEquals("%PDF".getBytes(), java.util.Arrays.copyOf(report, 4));
    }

    @Test
    void exportsExcel() {
        byte[] report = service.exportExcel(request);

        assertTrue(report.length > 100);
        // XLSX is a ZIP archive.
        assertArrayEquals(new byte[]{'P', 'K'}, java.util.Arrays.copyOf(report, 2));
    }
}
