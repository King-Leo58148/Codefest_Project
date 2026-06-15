package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.dto.LoginResponseDto;
import com.codewithlouis.codefest_project.dto.LoginUserDto;
import com.codewithlouis.codefest_project.dto.RegisterUserDto;
import com.codewithlouis.codefest_project.model.RefreshToken;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.services.AuthenticationService;
import com.codewithlouis.codefest_project.services.JwtService;
import com.codewithlouis.codefest_project.services.RefreshTokenService;
import com.codewithlouis.codefest_project.services.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/auth")
@RestController
@RequiredArgsConstructor
public class AuthenticationController {

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;
    private final RefreshTokenService refreshTokenService;
    private final TokenBlacklistService tokenBlacklistService;

    @PostMapping("/signup")
    public ResponseEntity<User> register(@RequestBody RegisterUserDto registerUserDto) {
        User registeredUser = authenticationService.signup(registerUserDto);
        return ResponseEntity.ok(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginUserDto input) {
        LoginResponseDto response = authenticationService.login(input);
        return ResponseEntity.ok(response);
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

            // also delete refresh token from DB
            String email = jwtService.extractUsername(token);
            authenticationService.logout(email);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}