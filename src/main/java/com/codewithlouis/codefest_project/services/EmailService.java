package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.Deal;
import com.codewithlouis.codefest_project.model.VerificationPurpose;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Sends transactional emails via Brevo's HTTP API (v3).
 *
 * SIGNUP_EMAIL  → branded email containing the 6-digit code the user types
 *                 into the app's verify-email screen.
 * PASSWORD_RESET → branded email containing a single clickable button that
 *                  opens the backend's /auth/reset-password-link endpoint,
 *                  which then deep-links back into the mobile app.
 */
@Service
public class EmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${nkoso.brevo.key}")
    private String apiKey;

    @Value("${brevo.from.email}")
    private String fromEmail;

    @Value("${brevo.from.name:Nkoso Platform}")
    private String fromName;

    @Value("${app.base-url}")
    private String appBaseUrl;

    @Value("${mfi.email:mfi-partner@email.com}")
    private String mfiEmail;

    private final HttpClient    httpClient   = HttpClient.newHttpClient();
    private final ObjectMapper  objectMapper = new ObjectMapper();

    /** No-arg constructor kept for test subclasses (RecordingEmailService). */
    public EmailService() {}

    // ── Public API ────────────────────────────────────────────────────────────

    public void sendVerificationCode(String email, String token, VerificationPurpose purpose) {
        String subject = getSubject(purpose);
        String html    = (purpose == VerificationPurpose.PASSWORD_RESET)
                ? buildResetLinkEmail(email, token)
                : buildSignupCodeEmail(email, token);
        send(email, subject, html);
    }

    @Async
    public void sendMfiNotification(Deal deal) {
        String subject = "New Deal Signed — Legal Review Required | Deal #" + deal.getId();
        send(mfiEmail, subject, buildMfiEmail(deal));
    }

    // ── Transport ─────────────────────────────────────────────────────────────

    private void send(String toAddress, String subject, String htmlContent) {
        try {
            Map<String, Object> payload = Map.of(
                "sender",      Map.of("email", fromEmail, "name", fromName),
                "to",          List.of(Map.of("email", toAddress)),
                "subject",     subject,
                "htmlContent", htmlContent
            );

            String body = objectMapper.writeValueAsString(payload);

            // ── Diagnostic logging — visible in Railway deploy logs ──────────
            String keyPrefix = (apiKey != null && apiKey.length() > 12)
                ? apiKey.substring(0, 12) + "..." : "(null or short)";
            System.out.println("[EmailService] === SEND START ===");
            System.out.println("[EmailService] To      : " + toAddress);
            System.out.println("[EmailService] Subject : " + subject);
            System.out.println("[EmailService] From    : " + fromEmail + " / " + fromName);
            System.out.println("[EmailService] API key : " + keyPrefix);
            System.out.println("[EmailService] URL     : " + BREVO_API_URL);
            System.out.println("[EmailService] Payload : " + body);
            // ────────────────────────────────────────────────────────────────

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BREVO_API_URL))
                .header("accept",       "application/json")
                .header("api-key",      apiKey)
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("[EmailService] Brevo status : " + response.statusCode());
            System.out.println("[EmailService] Brevo body   : " + response.body());

            if (response.statusCode() >= 400) {
                System.err.println("[EmailService] FAILED — HTTP " + response.statusCode()
                    + " — " + response.body());
                throw new RuntimeException(
                    "Failed to send email — Brevo returned HTTP " + response.statusCode()
                    + ": " + response.body());
            }

            System.out.println("[EmailService] === SEND OK === to " + toAddress);

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("[EmailService] EXCEPTION sending to " + toAddress
                + ": " + e.getClass().getSimpleName() + " — " + e.getMessage());
            throw new RuntimeException(
                "Failed to send email to " + toAddress + ": " + e.getMessage(), e);
        }
    }

    // ── Subjects ──────────────────────────────────────────────────────────────

    private String getSubject(VerificationPurpose purpose) {
        return switch (purpose) {
            case SIGNUP_EMAIL   -> "Verify your Nk\u0254so account";
            case PASSWORD_RESET -> "Reset your Nk\u0254so password";
        };
    }

    // ── HTML: signup code ─────────────────────────────────────────────────────

    private String buildSignupCodeEmail(String email, String code) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
              <title>Verify your email</title>
            </head>
            <body style="margin:0;padding:0;background:#F5F6FA;
                         font-family:Arial,Helvetica,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0"
                     style="background:#F5F6FA;padding:40px 0;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0"
                         style="background:#fff;border-radius:16px;overflow:hidden;
                                box-shadow:0 4px 24px rgba(0,0,0,.07);">

                    <tr>
                      <td style="background:#0D1B3E;padding:28px 40px;text-align:center;">
                        <span style="font-size:26px;font-weight:800;color:#fff;">
                          Nk<span style="color:#22C55E;">&#596;</span>so
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:40px 40px 32px;">
                        <h2 style="margin:0 0 16px;font-size:22px;color:#0F172A;">
                          Verify your email address
                        </h2>
                        <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.6;">
                          Welcome to Nk&#596;so! Enter the code below in the app to verify
                          <b>%s</b>.
                        </p>

                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding:0 0 28px;">
                              <div style="display:inline-block;background:#F0FDF4;
                                          border:2px solid #22C55E;border-radius:12px;
                                          padding:20px 48px;">
                                <span style="font-size:42px;font-weight:800;letter-spacing:14px;
                                             color:#0D1B3E;font-family:'Courier New',monospace;">
                                  %s
                                </span>
                              </div>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">
                          This code expires in <b>30 minutes</b>.
                          If you did not create a Nk&#596;so account you can safely ignore this email.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style="background:#F9FAFB;padding:20px 40px;text-align:center;
                                 border-top:1px solid #E5E7EB;">
                        <p style="margin:0;font-size:12px;color:#9CA3AF;">
                          &copy; 2025 Nk&#596;so &middot; Digital Investment Marketplace
                          &middot; Ghana<br/>
                          This is an automated message &mdash; please do not reply.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(email, code);
    }

    // ── HTML: password-reset link ─────────────────────────────────────────────

    private String buildResetLinkEmail(String email, String token) {
        String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
        String resetUrl = appBaseUrl
            + "/auth/reset-password-link?token=" + token
            + "&email=" + encodedEmail;

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
              <title>Reset your password</title>
            </head>
            <body style="margin:0;padding:0;background:#F5F6FA;
                         font-family:Arial,Helvetica,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0"
                     style="background:#F5F6FA;padding:40px 0;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0"
                         style="background:#fff;border-radius:16px;overflow:hidden;
                                box-shadow:0 4px 24px rgba(0,0,0,.07);">

                    <tr>
                      <td style="background:#0D1B3E;padding:28px 40px;text-align:center;">
                        <span style="font-size:26px;font-weight:800;color:#fff;">
                          Nk<span style="color:#22C55E;">&#596;</span>so
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:40px 40px 32px;">
                        <h2 style="margin:0 0 16px;font-size:22px;color:#0F172A;">
                          Reset your password
                        </h2>
                        <p style="margin:0 0 28px;font-size:15px;color:#4B5563;line-height:1.6;">
                          We received a request to reset the password for <b>%s</b>.
                          Tap the button below — it opens the app directly so you can
                          choose a new password.
                        </p>

                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding:0 0 28px;">
                              <a href="%s"
                                 style="display:inline-block;background:#0D1B3E;
                                        color:#fff;font-size:16px;font-weight:700;
                                        text-decoration:none;padding:16px 40px;
                                        border-radius:12px;letter-spacing:0.3px;">
                                Reset my password
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0 0 12px;font-size:13px;color:#6B7280;line-height:1.6;">
                          This link expires in <b>30 minutes</b> and can only be used once.
                          If you did not request a password reset, you can safely ignore this email
                          — your account is unchanged.
                        </p>
                        <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;
                                  word-break:break-all;">
                          If the button doesn't work, copy and open this URL in your browser:<br/>
                          <a href="%s" style="color:#0D1B3E;">%s</a>
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style="background:#F9FAFB;padding:20px 40px;text-align:center;
                                 border-top:1px solid #E5E7EB;">
                        <p style="margin:0;font-size:12px;color:#9CA3AF;">
                          &copy; 2025 Nk&#596;so &middot; Digital Investment Marketplace
                          &middot; Ghana<br/>
                          This is an automated message &mdash; please do not reply.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(email, resetUrl, resetUrl, resetUrl);
    }

    // ── HTML: MFI deal notification ───────────────────────────────────────────

    private String buildMfiEmail(Deal deal) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"/></head>
            <body style="margin:0;padding:0;background:#F5F6FA;
                         font-family:Arial,Helvetica,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0"
                     style="background:#F5F6FA;padding:40px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0"
                         style="background:#fff;border-radius:16px;overflow:hidden;
                                box-shadow:0 4px 24px rgba(0,0,0,.07);">

                    <tr>
                      <td style="background:#0D1B3E;padding:28px 40px;">
                        <span style="font-size:22px;font-weight:800;color:#fff;">
                          Nk<span style="color:#22C55E;">&#596;</span>so
                          <span style="font-size:14px;font-weight:400;
                                       color:rgba(255,255,255,.7);margin-left:12px;">
                            Legal Review Request
                          </span>
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:36px 40px;">
                        <h2 style="margin:0 0 8px;font-size:20px;color:#0F172A;">
                          New Deal Signed &mdash; Action Required
                        </h2>
                        <p style="margin:0 0 28px;font-size:15px;color:#4B5563;">
                          Both parties have signed deal <b>#%d</b>.
                          Please review and approve or reject below.
                        </p>
                        <table width="100%%" cellpadding="10" cellspacing="0"
                               style="border-collapse:collapse;border:1px solid #E5E7EB;
                                      font-size:14px;">
                          <tr style="background:#F9FAFB;">
                            <td style="width:40%%;color:#6B7280;border-bottom:1px solid #E5E7EB;">
                              <b>Deal ID</b></td>
                            <td style="color:#0F172A;border-bottom:1px solid #E5E7EB;">#%d</td>
                          </tr>
                          <tr>
                            <td style="color:#6B7280;border-bottom:1px solid #E5E7EB;"><b>Business</b></td>
                            <td style="color:#0F172A;border-bottom:1px solid #E5E7EB;">%s</td>
                          </tr>
                          <tr style="background:#F9FAFB;">
                            <td style="color:#6B7280;border-bottom:1px solid #E5E7EB;"><b>Owner</b></td>
                            <td style="color:#0F172A;border-bottom:1px solid #E5E7EB;">%s</td>
                          </tr>
                          <tr>
                            <td style="color:#6B7280;border-bottom:1px solid #E5E7EB;"><b>Ghana Card</b></td>
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
                            <td style="color:#6B7280;border-bottom:1px solid #E5E7EB;"><b>Amount</b></td>
                            <td style="color:#0F172A;border-bottom:1px solid #E5E7EB;">
                              <b>GH&#8373; %.2f</b></td>
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
                      </td>
                    </tr>

                    <tr>
                      <td style="background:#F9FAFB;padding:20px 40px;text-align:center;
                                 border-top:1px solid #E5E7EB;">
                        <p style="margin:0;font-size:12px;color:#9CA3AF;">
                          &copy; 2025 Nk&#596;so &middot; Digital Investment Marketplace
                          &middot; Ghana
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                deal.getId(), deal.getId(),
                deal.getPitch().getBusinessName(),
                deal.getOwner().getName(),
                deal.getOwner().getGhanaCardNumber(),
                deal.getOwner().getMomoNumber(),
                deal.getInvestor().getName(),
                deal.getBid().getAmount(),
                deal.getBid().getReturnType(),
                deal.getBid().getReturnValue(),
                deal.getBid().getTimelineMonths());
    }
}
