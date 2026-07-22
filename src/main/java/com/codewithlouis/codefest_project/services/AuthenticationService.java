package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.dto.EmailCodeRequest;
import com.codewithlouis.codefest_project.dto.ForgotPasswordRequest;
import com.codewithlouis.codefest_project.dto.LoginResponseDto;
import com.codewithlouis.codefest_project.dto.LoginUserDto;
import com.codewithlouis.codefest_project.dto.RegisterUserDto;
import com.codewithlouis.codefest_project.dto.ResetPasswordRequest;
import com.codewithlouis.codefest_project.model.RefreshToken;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.model.VerificationPurpose;
import com.codewithlouis.codefest_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private static final String VERIFICATION_CODE_COOLDOWN_MESSAGE =
            "A verification code was already sent recently";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;
    private final VerificationCodeService codeService;

    public User signup(RegisterUserDto input) {
        if (!input.getPassword().equals(input.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        String normalizedEmail = normalizeEmail(input.getEmail());
        User existingUser = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (existingUser != null) {
            if (existingUser.isEmailVerified()) {
                throw new RuntimeException("Email already in use");
            }
            existingUser.setEmailVerified(true);
            return userRepository.save(existingUser);
        }

        User user = new User();
        user.setName(input.getName());
        user.setEmail(normalizedEmail);
        user.setRole(input.getRole());
        user.setPassword(passwordEncoder.encode(input.getPassword()));
        user.setEmailVerified(true);

        return userRepository.save(user);
    }

    public LoginResponseDto login(LoginUserDto input) {
        String normalizedEmail = normalizeEmail(input.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        normalizedEmail,
                        input.getPassword()
                )
        );

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getEmail());

        return new LoginResponseDto(
                jwtService.generateToken(user),
                refreshToken.getToken(),
                jwtService.getExpirationTime()
        );
    }

    public void logout(String email) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new RuntimeException("User not found"));
        refreshTokenService.deleteByUser(user);
    }

    public void verifyEmail(EmailCodeRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        codeService.consume(normalizedEmail, VerificationPurpose.SIGNUP_EMAIL, request.getCode());

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    public void resendVerificationCode(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.isEmailVerified()) {
            throw new IllegalStateException("Email already verified");
        }
        codeService.issue(user.getEmail(), VerificationPurpose.SIGNUP_EMAIL);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        // Always return the same response whether or not the email exists
        // (prevents account enumeration). But we do NOT suppress cooldown
        // errors here — if a code was already sent recently, issue() will
        // throw IllegalStateException which propagates to the caller so the
        // user knows to check their inbox rather than thinking nothing happened.
        userRepository.findByEmailIgnoreCase(normalizeEmail(request.getEmail()))
                .ifPresent(user -> codeService.issue(user.getEmail(), VerificationPurpose.PASSWORD_RESET));
    }

    /**
     * Validates a password-reset token WITHOUT consuming it.
     * Called by the controller when the user clicks the link in their email
     * so we can redirect to the app. The token is consumed later by
     * resetPassword() when the user actually submits their new password.
     */
    public void validateResetToken(String email, String token) {
        codeService.peekToken(normalizeEmail(email), token);
    }

    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // consumeToken verifies the hex token from the reset link and
        // returns the normalised email that the token was issued for.
        String normalizedEmail = codeService.consumeToken(
                normalizeEmail(request.getEmail()),
                request.getToken()
        );

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenService.deleteByUser(user);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void issueSignupCode(String email) {
        issueCodeIgnoringCooldown(email, VerificationPurpose.SIGNUP_EMAIL);
    }

    private void issueCodeIgnoringCooldown(String email, VerificationPurpose purpose) {
        try {
            codeService.issue(email, purpose);
        } catch (IllegalStateException exception) {
            if (!VERIFICATION_CODE_COOLDOWN_MESSAGE.equals(exception.getMessage())) {
                throw exception;
            }
        }
    }
}