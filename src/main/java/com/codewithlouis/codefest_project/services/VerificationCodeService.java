package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.VerificationCode;
import com.codewithlouis.codefest_project.model.VerificationPurpose;
import com.codewithlouis.codefest_project.repository.VerificationCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class VerificationCodeService {

    // Signup still uses a short numeric code — user types it in the app.
    private static final int NUMERIC_CODE_LENGTH = 6;

    // Password-reset uses a 32-byte (64 hex char) secure random token
    // embedded in a link. No bcrypt needed — the token itself is unguessable.
    private static final int TOKEN_BYTES = 32;

    private static final int    MAX_ATTEMPTS            = 5;
    private static final long   RESEND_COOLDOWN_SECONDS = 60;
    private static final long   EXPIRY_MINUTES          = 30; // links get 30 min

    private final VerificationCodeRepository verificationCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final Clock clock;

    private final SecureRandom secureRandom = new SecureRandom();

    // ── Issue ─────────────────────────────────────────────────────────────────

    /**
     * Generates and emails a verification token/code for the given purpose.
     * <ul>
     *   <li>SIGNUP_EMAIL  → 6-digit numeric code, stored bcrypt-hashed, 30-min expiry</li>
     *   <li>PASSWORD_RESET → 64-char hex token, stored plain (it IS the secret), 30-min expiry</li>
     * </ul>
     */
    @Transactional
    public void issue(String email, VerificationPurpose purpose) {
        String normalizedEmail = normalizeEmail(email);
        LocalDateTime now = LocalDateTime.now(clock);

        List<VerificationCode> activeCodes = verificationCodeRepository
                .findByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(normalizedEmail, purpose);

        if (!activeCodes.isEmpty()) {
            VerificationCode newest = activeCodes.get(0);
            if (newest.getCreatedAt() != null
                    && newest.getCreatedAt().plusSeconds(RESEND_COOLDOWN_SECONDS).isAfter(now)) {
                throw new IllegalStateException("A verification code was already sent recently");
            }
            invalidateCodes(activeCodes, now);
        }

        String rawToken = (purpose == VerificationPurpose.PASSWORD_RESET)
                ? generateHexToken()
                : generateNumericCode();

        // For numeric codes we bcrypt-hash (brute-forceable otherwise).
        // For hex tokens the token itself is cryptographically strong —
        // store plain so we can do a simple equality check on verify.
        String stored = (purpose == VerificationPurpose.PASSWORD_RESET)
                ? rawToken
                : passwordEncoder.encode(rawToken);

        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(normalizedEmail);
        verificationCode.setCodeHash(stored);
        verificationCode.setPurpose(purpose);
        verificationCode.setCreatedAt(now);
        verificationCode.setExpiresAt(now.plusMinutes(EXPIRY_MINUTES));
        verificationCode.setAttemptCount(0);

        verificationCodeRepository.save(verificationCode);
        try {
            emailService.sendVerificationCode(normalizedEmail, rawToken, purpose);
        } catch (RuntimeException exception) {
            verificationCode.setConsumedAt(LocalDateTime.now(clock));
            verificationCodeRepository.save(verificationCode);
            throw exception;
        }
    }

    // ── Consume (numeric code — signup) ───────────────────────────────────────

    @Transactional
    public void consume(String email, VerificationPurpose purpose, String rawCode) {
        String normalizedEmail = normalizeEmail(email);
        LocalDateTime now = LocalDateTime.now(clock);

        List<VerificationCode> activeCodes = verificationCodeRepository
                .findByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(normalizedEmail, purpose);

        if (activeCodes.isEmpty()) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        VerificationCode currentCode = activeCodes.get(0);
        if (activeCodes.size() > 1) {
            invalidateCodes(activeCodes.subList(1, activeCodes.size()), now);
        }

        if (currentCode.getExpiresAt() != null && !now.isBefore(currentCode.getExpiresAt())) {
            currentCode.setConsumedAt(now);
            verificationCodeRepository.save(currentCode);
            throw new IllegalArgumentException("Invalid verification code");
        }

        if (!passwordEncoder.matches(rawCode, currentCode.getCodeHash())) {
            currentCode.setAttemptCount(currentCode.getAttemptCount() + 1);
            if (currentCode.getAttemptCount() >= MAX_ATTEMPTS) {
                currentCode.setConsumedAt(now);
            }
            verificationCodeRepository.save(currentCode);
            throw new IllegalArgumentException("Invalid verification code");
        }

        currentCode.setConsumedAt(now);
        verificationCodeRepository.save(currentCode);
    }

    // ── Peek (validate token without consuming — for link redirect) ───────────

    /**
     * Checks that the password-reset token is valid and unexpired
     * WITHOUT consuming it. Used when the user first clicks the email link
     * so we can safely redirect to the app before the user types a password.
     */
    @Transactional(readOnly = true)
    public void peekToken(String email, String token) {
        String normalizedEmail = normalizeEmail(email);
        LocalDateTime now = LocalDateTime.now(clock);

        List<VerificationCode> activeCodes = verificationCodeRepository
                .findByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
                        normalizedEmail, VerificationPurpose.PASSWORD_RESET);

        if (activeCodes.isEmpty()) {
            throw new IllegalArgumentException("Reset link is invalid or has already been used");
        }

        VerificationCode currentCode = activeCodes.get(0);

        if (currentCode.getExpiresAt() != null && !now.isBefore(currentCode.getExpiresAt())) {
            throw new IllegalArgumentException("Reset link has expired — please request a new one");
        }

        if (!currentCode.getCodeHash().equals(token)) {
            throw new IllegalArgumentException("Reset link is invalid");
        }
    }

    // ── Consume (hex token — password reset link) ─────────────────────────────

    /**
     * Verifies a password-reset token that arrived via a clicked email link.
     * Returns the normalised email so the caller can identify the user.
     */
    @Transactional
    public String consumeToken(String email, String token) {
        String normalizedEmail = normalizeEmail(email);
        LocalDateTime now = LocalDateTime.now(clock);

        List<VerificationCode> activeCodes = verificationCodeRepository
                .findByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
                        normalizedEmail, VerificationPurpose.PASSWORD_RESET);

        if (activeCodes.isEmpty()) {
            throw new IllegalArgumentException("Reset link is invalid or has already been used");
        }

        VerificationCode currentCode = activeCodes.get(0);
        if (activeCodes.size() > 1) {
            invalidateCodes(activeCodes.subList(1, activeCodes.size()), now);
        }

        if (currentCode.getExpiresAt() != null && !now.isBefore(currentCode.getExpiresAt())) {
            currentCode.setConsumedAt(now);
            verificationCodeRepository.save(currentCode);
            throw new IllegalArgumentException("Reset link has expired — please request a new one");
        }

        // Plain equality — the stored value IS the token for reset links
        if (!currentCode.getCodeHash().equals(token)) {
            currentCode.setAttemptCount(currentCode.getAttemptCount() + 1);
            if (currentCode.getAttemptCount() >= MAX_ATTEMPTS) {
                currentCode.setConsumedAt(now);
            }
            verificationCodeRepository.save(currentCode);
            throw new IllegalArgumentException("Reset link is invalid");
        }

        currentCode.setConsumedAt(now);
        verificationCodeRepository.save(currentCode);
        return normalizedEmail;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void invalidateCodes(List<VerificationCode> codes, LocalDateTime consumedAt) {
        for (VerificationCode code : codes) {
            code.setConsumedAt(consumedAt);
            verificationCodeRepository.save(code);
        }
    }

    private String generateNumericCode() {
        int upperBound = (int) Math.pow(10, NUMERIC_CODE_LENGTH);
        return String.format("%0" + NUMERIC_CODE_LENGTH + "d", secureRandom.nextInt(upperBound));
    }

    private String generateHexToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
