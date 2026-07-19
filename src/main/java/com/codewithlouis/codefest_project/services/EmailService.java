package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.Deal;
import com.codewithlouis.codefest_project.model.VerificationPurpose;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    @Value("${mfi.email}")
    private String mfiEmail;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Async
    public void sendMfiNotification(Deal deal) {
        String subject = "New Deal Signed — Legal Review Required | Deal #" + deal.getId();

        String body = """
                <h2>New Deal Signed on Nkɔso Platform</h2>
                <p>Both parties have signed the deal agreement. Please review and approve.</p>

                <h3>Deal Details</h3>
                <table border="1" cellpadding="8">
                    <tr><td><b>Deal ID</b></td><td>%d</td></tr>
                    <tr><td><b>Business Name</b></td><td>%s</td></tr>
                    <tr><td><b>Business Owner</b></td><td>%s</td></tr>
                    <tr><td><b>Ghana Card Number</b></td><td>%s</td></tr>
                    <tr><td><b>MoMo Number</b></td><td>%s</td></tr>
                    <tr><td><b>Investor</b></td><td>%s</td></tr>
                    <tr><td><b>Deal Amount</b></td><td>GH₵ %.2f</td></tr>
                    <tr><td><b>Return Type</b></td><td>%s</td></tr>
                    <tr><td><b>Return Value</b></td><td>%.2f%%</td></tr>
                    <tr><td><b>Timeline</b></td><td>%d months</td></tr>
                </table>

                <p>Please log in to the Nkɔso admin portal to approve or reject this deal.</p>
                <p>— Nkɔso Platform</p>
                """.formatted(
                deal.getId(),
                deal.getPitch().getBusinessName(),
                deal.getOwner().getName(),
                deal.getOwner().getGhanaCardNumber(),
                deal.getOwner().getMomoNumber(),
                deal.getInvestor().getName(),
                deal.getBid().getAmount(),
                deal.getBid().getReturnType(),
                deal.getBid().getReturnValue(),
                deal.getBid().getTimelineMonths()
        );

        send(mfiEmail, subject, body);
    }

    public void sendVerificationCode(String email, String code, VerificationPurpose purpose) {
        String subject = getVerificationSubject(purpose);
        String body = """
                <h2>%s</h2>
                <p>Your verification code is:</p>
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">%s</p>
                <p>This code expires in 10 minutes.</p>
                <p>If you did not request this, you can ignore this email.</p>
                """.formatted(getVerificationHeading(purpose), code);

        boolean sent = send(email, subject, body);
        if (!sent) {
            throw new RuntimeException("Failed to send verification email");
        }
    }

    private boolean send(String to, String subject, String htmlBody) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("from", fromEmail);
            payload.put("to", new String[]{to});
            payload.put("subject", subject);
            payload.put("html", htmlBody);

            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                System.err.println("Resend API error (" + response.statusCode() + "): " + response.body());
                return false;
            }
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            return false;
        }
    }

    private String getVerificationSubject(VerificationPurpose purpose) {
        return switch (purpose) {
            case SIGNUP_EMAIL -> "Nkoso account verification code";
            case PASSWORD_RESET -> "Nkoso password reset code";
        };
    }

    private String getVerificationHeading(VerificationPurpose purpose) {
        return switch (purpose) {
            case SIGNUP_EMAIL -> "Verify your Nkoso account";
            case PASSWORD_RESET -> "Reset your Nkoso password";
        };
    }
}