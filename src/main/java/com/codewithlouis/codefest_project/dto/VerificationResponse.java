package com.codewithlouis.codefest_project.dto;



import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VerificationResponse {
    private boolean verified;
    private String cardNumber;
    private String imageUrl;
    private String message;

    @Data
    public static class VerificationRequest {

        @NotBlank(message = "Ghana Card number is required")
        private String cardNumber;
    }
}