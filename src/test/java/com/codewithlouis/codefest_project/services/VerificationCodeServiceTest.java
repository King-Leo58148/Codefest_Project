package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.VerificationCode;
import com.codewithlouis.codefest_project.model.VerificationPurpose;
import com.codewithlouis.codefest_project.repository.VerificationCodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VerificationCodeServiceTest {

    @Mock
    private VerificationCodeRepository verificationCodeRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private EmailService emailService;

    private VerificationCodeService service;
    private LocalDateTime now;
    private RecordingEmailService recordingEmailService;

    @Captor
    private ArgumentCaptor<VerificationCode> codeCaptor;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-07-12T12:00:00Z"), ZoneOffset.UTC);
        now = LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
        recordingEmailService = new RecordingEmailService();
        emailService = recordingEmailService;
        service = new VerificationCodeService(verificationCodeRepository, passwordEncoder, emailService, clock);
    }

    @Test
    void issuedCodeIsHashedAndExpiresInTenMinutes() {
        when(verificationCodeRepository.findByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
                "user@example.com", VerificationPurpose.SIGNUP_EMAIL)).thenReturn(List.of());
        when(passwordEncoder.encode(any(String.class)))
                .thenAnswer(invocation -> "hashed-" + invocation.getArgument(0, String.class));
        when(verificationCodeRepository.save(any(VerificationCode.class)))
                .thenAnswer(invocation -> invocation.getArgument(0, VerificationCode.class));

        service.issue(" User@example.com ", VerificationPurpose.SIGNUP_EMAIL);

        verify(verificationCodeRepository).save(codeCaptor.capture());
        VerificationCode saved = codeCaptor.getValue();
        assertEquals("user@example.com", saved.getEmail());
        assertFalse(saved.getCodeHash().matches("\\d{6}"));
        assertEquals(now.plusMinutes(10), saved.getExpiresAt());
        assertEquals(now, saved.getCreatedAt());
        assertNull(saved.getConsumedAt());
        assertEquals(0, saved.getAttemptCount());
        assertEquals("user@example.com", recordingEmailService.lastEmail);
        assertEquals(VerificationPurpose.SIGNUP_EMAIL, recordingEmailService.lastPurpose);
        assertFalse(recordingEmailService.lastCode == null || !recordingEmailService.lastCode.matches("\\d{6}"));
        assertEquals(1, recordingEmailService.sendCount);
    }

    @Test
    void passwordResetCodeCannotVerifySignup() {
        when(verificationCodeRepository.findByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
                "user@example.com", VerificationPurpose.SIGNUP_EMAIL)).thenReturn(List.of());

        assertThrows(IllegalArgumentException.class,
                () -> service.consume("user@example.com", VerificationPurpose.SIGNUP_EMAIL, "123456"));
    }

    @Test
    void fiveFailedAttemptsInvalidateCode() {
        VerificationCode activeCode = activeCode("user@example.com", VerificationPurpose.SIGNUP_EMAIL, "hashed-111111");
        when(verificationCodeRepository.findByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
                "user@example.com", VerificationPurpose.SIGNUP_EMAIL)).thenAnswer(invocation ->
                activeCode.getConsumedAt() == null ? List.of(activeCode) : List.of());
        when(verificationCodeRepository.save(any(VerificationCode.class)))
                .thenAnswer(invocation -> invocation.getArgument(0, VerificationCode.class));
        when(passwordEncoder.matches("000000", "hashed-111111")).thenReturn(false);

        for (int attempt = 1; attempt <= 5; attempt++) {
            assertThrows(IllegalArgumentException.class,
                    () -> service.consume("user@example.com", VerificationPurpose.SIGNUP_EMAIL, "000000"));
            assertEquals(attempt, activeCode.getAttemptCount());
        }

        assertEquals(now, activeCode.getConsumedAt());
        verify(verificationCodeRepository, times(5)).save(activeCode);
    }

    @Test
    void consumedCodeIsOneTimeUse() {
        VerificationCode activeCode = activeCode("user@example.com", VerificationPurpose.SIGNUP_EMAIL, "hashed-654321");
        when(verificationCodeRepository.findByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
                "user@example.com", VerificationPurpose.SIGNUP_EMAIL)).thenAnswer(invocation ->
                activeCode.getConsumedAt() == null ? List.of(activeCode) : List.of());
        when(verificationCodeRepository.save(any(VerificationCode.class)))
                .thenAnswer(invocation -> invocation.getArgument(0, VerificationCode.class));
        when(passwordEncoder.matches("654321", "hashed-654321")).thenReturn(true);

        assertDoesNotThrow(() -> service.consume("user@example.com", VerificationPurpose.SIGNUP_EMAIL, "654321"));
        assertEquals(now, activeCode.getConsumedAt());

        assertThrows(IllegalArgumentException.class,
                () -> service.consume("user@example.com", VerificationPurpose.SIGNUP_EMAIL, "654321"));
    }

    @Test
    void codeExpiringExactlyNowIsRejected() {
        VerificationCode activeCode = activeCode("user@example.com", VerificationPurpose.SIGNUP_EMAIL, "hashed-654321");
        activeCode.setExpiresAt(now);
        when(verificationCodeRepository.findByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
                "user@example.com", VerificationPurpose.SIGNUP_EMAIL)).thenAnswer(invocation ->
                activeCode.getConsumedAt() == null ? List.of(activeCode) : List.of());
        when(verificationCodeRepository.save(any(VerificationCode.class)))
                .thenAnswer(invocation -> invocation.getArgument(0, VerificationCode.class));

        assertThrows(IllegalArgumentException.class,
                () -> service.consume("user@example.com", VerificationPurpose.SIGNUP_EMAIL, "654321"));

        assertEquals(now, activeCode.getConsumedAt());
        verify(passwordEncoder, never()).matches(any(String.class), any(String.class));
    }

    @Test
    void issuingWithinSixtySecondsIsRejected() {
        VerificationCode recentCode = activeCode("user@example.com", VerificationPurpose.SIGNUP_EMAIL, "hashed-111111");
        recentCode.setCreatedAt(now.minusSeconds(59));
        when(verificationCodeRepository.findByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
                "user@example.com", VerificationPurpose.SIGNUP_EMAIL)).thenReturn(List.of(recentCode));

        assertThrows(IllegalStateException.class,
                () -> service.issue("user@example.com", VerificationPurpose.SIGNUP_EMAIL));

        verify(verificationCodeRepository, never()).save(any(VerificationCode.class));
        assertEquals(0, recordingEmailService.sendCount);
    }

    @Test
    void reissueAfterSixtySecondsInvalidatesEarlierRecords() {
        VerificationCode newest = activeCode("user@example.com", VerificationPurpose.SIGNUP_EMAIL, "hashed-111111");
        newest.setCreatedAt(now.minusSeconds(61));
        VerificationCode older = activeCode("user@example.com", VerificationPurpose.SIGNUP_EMAIL, "hashed-222222");
        older.setCreatedAt(now.minusMinutes(5));

        when(verificationCodeRepository.findByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
                "user@example.com", VerificationPurpose.SIGNUP_EMAIL)).thenReturn(List.of(newest, older));
        when(passwordEncoder.encode(any(String.class)))
                .thenAnswer(invocation -> "hashed-" + invocation.getArgument(0, String.class));
        when(verificationCodeRepository.save(any(VerificationCode.class)))
                .thenAnswer(invocation -> invocation.getArgument(0, VerificationCode.class));

        service.issue("user@example.com", VerificationPurpose.SIGNUP_EMAIL);

        verify(verificationCodeRepository, times(3)).save(codeCaptor.capture());
        List<VerificationCode> savedCodes = codeCaptor.getAllValues();
        assertEquals(now, savedCodes.get(0).getConsumedAt());
        assertEquals(now, savedCodes.get(1).getConsumedAt());
        assertNull(savedCodes.get(2).getConsumedAt());
        assertEquals(now.plusMinutes(10), savedCodes.get(2).getExpiresAt());
    }

    @Test
    void emailSendFailureConsumesFreshCodeAndAllowsImmediateRetry() {
        List<VerificationCode> storedCodes = new ArrayList<>();
        recordingEmailService.failNextSend(new RuntimeException("SMTP down"));

        when(verificationCodeRepository.findByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
                "user@example.com", VerificationPurpose.SIGNUP_EMAIL)).thenAnswer(invocation ->
                storedCodes.stream()
                        .filter(code -> code.getConsumedAt() == null)
                        .sorted(Comparator.comparing(VerificationCode::getCreatedAt).reversed())
                        .toList());
        when(passwordEncoder.encode(any(String.class)))
                .thenAnswer(invocation -> "hashed-" + invocation.getArgument(0, String.class));
        when(verificationCodeRepository.save(any(VerificationCode.class)))
                .thenAnswer(invocation -> {
                    VerificationCode code = invocation.getArgument(0, VerificationCode.class);
                    if (!storedCodes.contains(code)) {
                        storedCodes.add(code);
                    }
                    return code;
                });

        RuntimeException failure = assertThrows(RuntimeException.class,
                () -> service.issue("user@example.com", VerificationPurpose.SIGNUP_EMAIL));
        assertEquals("SMTP down", failure.getMessage());

        VerificationCode failedCode = storedCodes.get(0);
        assertEquals(now, failedCode.getConsumedAt());

        assertDoesNotThrow(() -> service.issue("user@example.com", VerificationPurpose.SIGNUP_EMAIL));

        assertEquals(2, storedCodes.size());
        VerificationCode retriedCode = storedCodes.get(1);
        assertNull(retriedCode.getConsumedAt());
        assertEquals(now.plusMinutes(10), retriedCode.getExpiresAt());
        assertEquals(2, recordingEmailService.sendCount);
    }

    private VerificationCode activeCode(String email, VerificationPurpose purpose, String codeHash) {
        VerificationCode code = new VerificationCode();
        code.setEmail(email);
        code.setPurpose(purpose);
        code.setCodeHash(codeHash);
        code.setCreatedAt(now.minusMinutes(1));
        code.setExpiresAt(now.plusMinutes(9));
        code.setAttemptCount(0);
        return code;
    }

    private static class RecordingEmailService extends EmailService {
        private String lastEmail;
        private String lastCode;
        private VerificationPurpose lastPurpose;
        private int sendCount;
        private RuntimeException nextFailure;

        private RecordingEmailService() {
            super(null);
        }

        private void failNextSend(RuntimeException failure) {
            nextFailure = failure;
        }

        @Override
        public void sendVerificationCode(String email, String code, VerificationPurpose purpose) {
            lastEmail = email;
            lastCode = code;
            lastPurpose = purpose;
            sendCount++;
            if (nextFailure != null) {
                RuntimeException failure = nextFailure;
                nextFailure = null;
                throw failure;
            }
        }
    }
}
