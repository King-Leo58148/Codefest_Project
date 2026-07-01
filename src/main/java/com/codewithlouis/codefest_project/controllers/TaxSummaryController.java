package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.dto.TaxSummaryDto;
import com.codewithlouis.codefest_project.services.TaxSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tax-summaries")
@RequiredArgsConstructor
public class TaxSummaryController {

    private final TaxSummaryService taxSummaryService;

    @GetMapping
    public ResponseEntity<List<TaxSummaryDto>> getTaxSummaries() {
        return ResponseEntity.ok(taxSummaryService.getTaxSummaries());
    }

    @GetMapping("/download/{year}")
    public ResponseEntity<String> downloadTaxSummary(@PathVariable String year) {
        // Placeholder for actual PDF generation/download.
        return ResponseEntity.ok("Tax summary PDF generation is not implemented yet for year " + year);
    }
}
