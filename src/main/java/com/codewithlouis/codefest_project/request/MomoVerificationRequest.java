package com.codewithlouis.codefest_project.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MomoVerificationRequest {
    @NotBlank(message = "MoMo number is required")
    private String momoNumber;
}