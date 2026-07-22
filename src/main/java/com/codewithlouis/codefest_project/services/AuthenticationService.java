package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.dto.LoginResponseDto;
import com.codewithlouis.codefest_project.dto.LoginUserDto;
import com.codewithlouis.codefest_project.dto.RegisterUserDto;
import com.codewithlouis.codefest_project.model.RefreshToken;
import com.codewithlouis.codefest_project.model.User;
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

    public User signup(RegisterUserDto input) {
        if (!input.getPassword().equals(input.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        String normalizedEmail = normalizeEmail(input.getEmail());
        User existingUser = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (existingUser != null) {
            throw new RuntimeException("Email already in use");
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

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
