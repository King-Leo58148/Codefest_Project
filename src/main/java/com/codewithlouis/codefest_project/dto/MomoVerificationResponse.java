package com.codewithlouis.codefest_project.dto;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MomoVerificationResponse {
    private boolean verified;
    private String momoNumber;
    private String message;
}