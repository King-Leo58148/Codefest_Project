package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.Deal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mfi.email}")
    private String mfiEmail;

    public void sendMfiNotification(Deal deal) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("nkosobusiness@gmail.com");
            helper.setTo(mfiEmail);
            helper.setSubject("New Deal Signed — Legal Review Required | Deal #" + deal.getId());

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

            helper.setText(body, true);
            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send MFI email: " + e.getMessage());
        }
    }
}