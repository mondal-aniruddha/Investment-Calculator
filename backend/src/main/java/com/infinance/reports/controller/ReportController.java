package com.infinance.reports.controller;

import com.infinance.reports.dto.PersonalizedReportRequest;
import com.infinance.reports.service.ReportExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Personalized reports", description = "Export combined calculator results and applied assumptions")
public class ReportController {
    private final ReportExportService reportExportService;

    public ReportController(ReportExportService reportExportService) {
        this.reportExportService = reportExportService;
    }

    @PostMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(summary = "Export a personalized PDF report",
            description = "Returns an attachment containing the combined calculator results and assumptions supplied in the request.")
    public ResponseEntity<byte[]> exportPdf(@Valid @RequestBody PersonalizedReportRequest request) {
        return response(reportExportService.exportPdf(request), MediaType.APPLICATION_PDF, "infinance-report.pdf");
    }

    @PostMapping(value = "/excel",
            produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @Operation(summary = "Export a personalized Excel report",
            description = "Returns an XLSX attachment containing the combined calculator results and assumptions supplied in the request.")
    public ResponseEntity<byte[]> exportExcel(@Valid @RequestBody PersonalizedReportRequest request) {
        return response(reportExportService.exportExcel(request),
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
                "infinance-report.xlsx");
    }

    private ResponseEntity<byte[]> response(byte[] body, MediaType mediaType, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(filename)
                .build());
        headers.setContentLength(body.length);
        return ResponseEntity.ok().headers(headers).body(body);
    }
}
