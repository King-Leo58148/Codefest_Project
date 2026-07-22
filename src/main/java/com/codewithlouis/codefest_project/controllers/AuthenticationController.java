package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.dto.EmailCodeRequest;
import com.codewithlouis.codefest_project.dto.ForgotPasswordRequest;
import com.codewithlouis.codefest_project.dto.LoginResponseDto;
import com.codewithlouis.codefest_project.dto.LoginUserDto;
import com.codewithlouis.codefest_project.dto.RegisterUserDto;
import com.codewithlouis.codefest_project.dto.ResetPasswordRequest;
import com.codewithlouis.codefest_project.model.RefreshToken;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.repository.UserRepository;
import com.codewithlouis.codefest_project.services.AuthenticationService;
import com.codewithlouis.codefest_project.services.JwtService;
import com.codewithlouis.codefest_project.services.RefreshTokenService;
import com.codewithlouis.codefest_project.services.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RequestMapping("/auth")
@RestController
@RequiredArgsConstructor
public class AuthenticationController {

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;
    private final RefreshTokenService refreshTokenService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;

    /**
     * Deep-link scheme used when redirecting the user back to the mobile app
     * after they click the password-reset link in their email.
     * The app must register this scheme in app.json (scheme: "nkoso").
     */
    @Value("${app.deep-link-scheme:nkoso}")
    private String deepLinkScheme;

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterUserDto registerUserDto) {
        User registeredUser = authenticationService.signup(registerUserDto);
        return ResponseEntity.ok(Map.of(
                "email", registeredUser.getEmail(),
                "verificationRequired", !registeredUser.isEmailVerified()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginUserDto input) {
        LoginResponseDto response = authenticationService.login(input);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody EmailCodeRequest request) {
        authenticationService.verifyEmail(request);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }

    @PostMapping("/resend-verification-code")
    public ResponseEntity<Map<String, String>> resendVerificationCode(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        authenticationService.resendVerificationCode(request);
        return ResponseEntity.ok(Map.of("message", "Verification code sent successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authenticationService.forgotPassword(request);
        return ResponseEntity.ok(Map.of(
                "message",
                "If an account exists for that email, a password reset code has been sent"
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authenticationService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    /**
     * GET /auth/reset-password-link?token=TOKEN&email=EMAIL
     *
     * Called when the user taps "Reset my password" in the email.
     * Validates the token, then redirects to a deep link that opens the
     * Nkɔso mobile app on the new-password screen with the token pre-filled.
     *
     * Deep link format:  nkoso://reset-password?token=TOKEN&email=EMAIL
     *
     * If the token is invalid or expired, redirects to the app with an error
     * query param so the app can show an appropriate message.
     */
    @GetMapping("/reset-password-link")
    public ResponseEntity<Void> handleResetPasswordLink(
            @RequestParam String token,
            @RequestParam String email) {

        String redirectUri;
        try {
            // Validate only — do NOT consume the token here.
            // The token is consumed by POST /auth/reset-password after the
            // user enters their new password.
            authenticationService.validateResetToken(email, token);

            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
            String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
            redirectUri = deepLinkScheme + "://reset-password?token="
                    + encodedToken + "&email=" + encodedEmail;
        } catch (Exception e) {
            String encodedMsg = URLEncoder.encode(
                    e.getMessage() != null ? e.getMessage() : "Invalid or expired link",
                    StandardCharsets.UTF_8);
            redirectUri = deepLinkScheme + "://reset-password?error=" + encodedMsg;
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, redirectUri)
                .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refresh(@RequestBody Map<String, String> body) {
        String requestToken = body.get("refreshToken");

        RefreshToken refreshToken = refreshTokenService.findByToken(requestToken)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        refreshTokenService.verifyExpiration(refreshToken);

        User user = refreshToken.getUser();
        String newAccessToken = jwtService.generateToken(user);

        return ResponseEntity.ok(new LoginResponseDto(
                newAccessToken,
                requestToken,
                jwtService.getExpirationTime()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenBlacklistService.blacklist(token);
            String email = jwtService.extractUsername(token);
            authenticationService.logout(email);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }
}