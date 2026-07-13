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
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class VerificationCodeService {
    private static final int CODE_LENGTH = 6;
    private static final int MAX_ATTEMPTS = 5;
    private static final long RESEND_COOLDOWN_SECONDS = 60;
    private static final long EXPIRY_MINUTES = 10;

    private final VerificationCodeRepository verificationCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final Clock clock;

    private final SecureRandom secureRandom = new SecureRandom();

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

        String rawCode = generateCode();
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(normalizedEmail);
        verificationCode.setCodeHash(passwordEncoder.encode(rawCode));
        verificationCode.setPurpose(purpose);
        verificationCode.setCreatedAt(now);
        verificationCode.setExpiresAt(now.plusMinutes(EXPIRY_MINUTES));
        verificationCode.setAttemptCount(0);

        verificationCodeRepository.save(verificationCode);
        try {
            emailService.sendVerificationCode(normalizedEmail, rawCode, purpose);
        } catch (RuntimeException exception) {
            verificationCode.setConsumedAt(LocalDateTime.now(clock));
            verificationCodeRepository.save(verificationCode);
            throw exception;
        }
    }

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

    private void invalidateCodes(List<VerificationCode> codes, LocalDateTime consumedAt) {
        for (VerificationCode code : codes) {
            code.setConsumedAt(consumedAt);
            verificationCodeRepository.save(code);
        }
    }

    private String generateCode() {
        int upperBound = (int) Math.pow(10, CODE_LENGTH);
        return String.format("%0" + CODE_LENGTH + "d", secureRandom.nextInt(upperBound));
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
