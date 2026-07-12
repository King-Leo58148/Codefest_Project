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
        User existingUser = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (existingUser != null) {
            if (existingUser.isEmailVerified()) {
                throw new RuntimeException("Email already in use");
            }
            codeService.issue(existingUser.getEmail(), VerificationPurpose.SIGNUP_EMAIL);
            return existingUser;
        }

        User user = new User();
        user.setName(input.getName());
        user.setEmail(normalizedEmail);
        user.setRole(input.getRole());
        user.setPassword(passwordEncoder.encode(input.getPassword()));
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);
        codeService.issue(savedUser.getEmail(), VerificationPurpose.SIGNUP_EMAIL);
        return savedUser;
    }

    public LoginResponseDto login(LoginUserDto input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getEmail(),
                        input.getPassword()
                )
        );

        User user = userRepository.findByEmail(normalizeEmail(input.getEmail()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEmailVerified()) {
            throw new IllegalStateException("Email not verified");
        }

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getEmail());

        return new LoginResponseDto(
                jwtService.generateToken(user),
                refreshToken.getToken(),
                jwtService.getExpirationTime()
        );
    }

    public void logout(String email) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new RuntimeException("User not found"));
        refreshTokenService.deleteByUser(user);
    }

    public void verifyEmail(EmailCodeRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        codeService.consume(normalizedEmail, VerificationPurpose.SIGNUP_EMAIL, request.getCode());

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    public void resendVerificationCode(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.isEmailVerified()) {
            throw new IllegalStateException("Email already verified");
        }
        codeService.issue(user.getEmail(), VerificationPurpose.SIGNUP_EMAIL);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(normalizeEmail(request.getEmail()))
                .ifPresent(user -> codeService.issue(user.getEmail(), VerificationPurpose.PASSWORD_RESET));
    }

    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        String normalizedEmail = normalizeEmail(request.getEmail());
        codeService.consume(normalizedEmail, VerificationPurpose.PASSWORD_RESET, request.getCode());

        User user = userRepository.findByEmail(normalizedEmail)
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
}
