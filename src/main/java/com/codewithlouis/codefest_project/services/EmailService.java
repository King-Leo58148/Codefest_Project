package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.Deal;
import com.codewithlouis.codefest_project.model.VerificationPurpose;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${nkoso.mail.from}")
    private String fromEmail;

    @Value("${mfi.email}")
    private String mfiEmail;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Sends the 6-digit verification / password-reset code to the real
     * recipient address. No sandbox override — Brevo SMTP delivers to any
     * valid inbox.
     */
    public void sendVerificationCode(String email, String code, VerificationPurpose purpose) {
        String subject = getVerificationSubject(purpose);
        String body    = buildCodeEmail(email, code, purpose);
        send(email, subject, body);
    }

    /**
     * Notifies the MFI partner when both parties have signed a deal.
     * Runs on a background thread so it never blocks the HTTP response.
     */
    @Async
    public void sendMfiNotification(Deal deal) {
        String subject = "New Deal Signed — Legal Review Required | Deal #" + deal.getId();
        String body    = buildMfiEmail(deal);
        send(mfiEmail, subject, body);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "Nkɔso Platform");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            // Log and rethrow so VerificationCodeService can roll back the
            // saved code on delivery failure.
            System.err.println("[EmailService] Failed to send email to " + to + ": " + e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    private String getVerificationSubject(VerificationPurpose purpose) {
        return switch (purpose) {
            case SIGNUP_EMAIL   -> "Verify your Nkɔso account";
            case PASSWORD_RESET -> "Reset your Nkɔso password";
        };
    }

    private String buildCodeEmail(String email, String code, VerificationPurpose purpose) {
        boolean isReset = purpose == VerificationPurpose.PASSWORD_RESET;
        String heading  = isReset ? "Reset your password" : "Verify your email address";
        String intro    = isReset
                ? "We received a request to reset the password for <b>" + email + "</b>."
                : "Welcome to Nkɔso! Use the code below to verify <b>" + email + "</b>.";
        String note     = isReset
                ? "This code expires in <b>10 minutes</b>. If you did not request a password reset, ignore this email — your account is safe."
                : "This code expires in <b>10 minutes</b>. If you did not create a Nkɔso account, ignore this email.";

        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8"/>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:#F5F6FA;font-family:Arial,Helvetica,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F5F6FA;padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0"
                               style="background:#ffffff;border-radius:16px;overflow:hidden;
                                      box-shadow:0 4px 24px rgba(0,0,0,0.07);">

                          <!-- Header -->
                          <tr>
                            <td style="background:#0D1B3E;padding:28px 40px;text-align:center;">
                              <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:1px;">
                                Nk<span style="color:#22C55E;">ɔ</span>so
                              </span>
                            </td>
                          </tr>

                          <!-- Body -->
                          <tr>
                            <td style="padding:40px 40px 32px;">
                              <h2 style="margin:0 0 16px;font-size:22px;color:#0F172A;">%s</h2>
                              <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.6;">%s</p>

                              <!-- Code block -->
                              <table width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td align="center" style="padding:0 0 28px;">
                                    <div style="display:inline-block;background:#F0FDF4;
                                                border:2px solid #22C55E;border-radius:12px;
                                                padding:20px 40px;">
                                      <span style="font-size:40px;font-weight:800;
                                                   letter-spacing:12px;color:#0D1B3E;
                                                   font-family:'Courier New',monospace;">
                                        %s
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              </table>

                              <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">%s</p>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="background:#F9FAFB;padding:20px 40px;text-align:center;
                                       border-top:1px solid #E5E7EB;">
                              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                                © 2025 Nkɔso · Digital Investment Marketplace · Ghana<br/>
                                This is an automated message — please do not reply.
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(heading, heading, intro, code, note);
    }

    private String buildMfiEmail(Deal deal) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head><meta charset="UTF-8"/></head>
                <body style="margin:0;padding:0;background:#F5F6FA;font-family:Arial,Helvetica,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F5F6FA;padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0"
                               style="background:#ffffff;border-radius:16px;overflow:hidden;
                                      box-shadow:0 4px 24px rgba(0,0,0,0.07);">

                          <tr>
                            <td style="background:#0D1B3E;padding:28px 40px;">
                              <span style="font-size:22px;font-weight:800;color:#ffffff;">
                                Nk<span style="color:#22C55E;">ɔ</span>so
                                <span style="font-size:14px;font-weight:400;color:rgba(255,255,255,0.7);
                                             margin-left:12px;">Legal Review Request</span>
                              </span>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding:36px 40px;">
                              <h2 style="margin:0 0 8px;font-size:20px;color:#0F172A;">
                                New Deal Signed — Action Required
                              </h2>
                              <p style="margin:0 0 28px;font-size:15px;color:#4B5563;">
                                Both parties have digitally signed deal <b>#%d</b> on the Nkɔso platform.
                                Please review and approve or reject the agreement below.
                              </p>

                              <table width="100%%" cellpadding="10" cellspacing="0"
                                     style="border-collapse:collapse;border-radius:10px;overflow:hidden;
                                            border:1px solid #E5E7EB;font-size:14px;">
                                <tr style="background:#F9FAFB;">
                                  <td style="width:40%%;color:#6B7280;border-bottom:1px solid #E5E7EB;"><b>Deal ID</b></td>
                                  <td style="color:#0F172A;border-bottom:1px solid #E5E7EB;">#%d</td>
                                </tr>
                                <tr>
                                  <td style="color:#6B7280;border-bottom:1px solid #E5E7EB;"><b>Business Name</b></td>
                                  <td style="color:#0F172A;border-bottom:1px solid #E5E7EB;">%s</td>
                                </tr>
                                <tr style="background:#F9FAFB;">
                                  <td style="color:#6B7280;border-bottom:1px solid #E5E7EB;"><b>Business Owner</b></td>
                                  <td style="color:#0F172A;border-bottom:1px solid #E5E7EB;">%s</td>
                                </tr>
                                <tr>
                                  <td style="color:#6B7280;border-bottom:1px solid #E5E7EB;"><b>Ghana Card Number</b></td>
                                  <td style="color:#0F172A;border-bottom:1px solid #E5E7EB;">%s</td>
                                </tr>
                                <tr style="background:#F9FAFB;">
                                  <td style="color:#6B7280;border-bottom:1px solid #E5E7EB;"><b>Owner MoMo</b></td>
                                  <td style="color:#0F172A;border-bottom:1px solid #E5E7EB;">%s</td>
                                </tr>
                                <tr>
                                  <td style="color:#6B7280;border-bottom:1px solid #E5E7EB;"><b>Investor</b></td>
                                  <td style="color:#0F172A;border-bottom:1px solid #E5E7EB;">%s</td>
                                </tr>
                                <tr style="background:#F9FAFB;">
                                  <td style="color:#6B7280;border-bottom:1px solid #E5E7EB;"><b>Deal Amount</b></td>
                                  <td style="color:#0F172A;border-bottom:1px solid #E5E7EB;"><b>GH₵ %.2f</b></td>
                                </tr>
                                <tr>
                                  <td style="color:#6B7280;border-bottom:1px solid #E5E7EB;"><b>Return Type</b></td>
                                  <td style="color:#0F172A;border-bottom:1px solid #E5E7EB;">%s</td>
                                </tr>
                                <tr style="background:#F9FAFB;">
                                  <td style="color:#6B7280;border-bottom:1px solid #E5E7EB;"><b>Return Value</b></td>
                                  <td style="color:#0F172A;border-bottom:1px solid #E5E7EB;">%.2f%%</td>
                                </tr>
                                <tr>
                                  <td style="color:#6B7280;"><b>Timeline</b></td>
                                  <td style="color:#0F172A;">%d months</td>
                                </tr>
                              </table>

                              <p style="margin:28px 0 0;font-size:13px;color:#6B7280;line-height:1.6;">
                                Please log in to the Nkɔso admin portal to approve or reject this deal.
                                The investor's funds will only be disbursed after your approval.
                              </p>
                            </td>
                          </tr>

                          <tr>
                            <td style="background:#F9FAFB;padding:20px 40px;text-align:center;
                                       border-top:1px solid #E5E7EB;">
                              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                                © 2025 Nkɔso · Digital Investment Marketplace · Ghana
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                deal.getId(),
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
    }
}
