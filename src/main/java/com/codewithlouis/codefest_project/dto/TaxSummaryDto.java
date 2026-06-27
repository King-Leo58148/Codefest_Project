package com.codewithlouis.codefest_project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TaxSummaryDto {
    private String year;
    private Double totalInvested;
    private Double totalReturns;
    private Integer deals;
    private String status;
    private String downloadUrl;
}
