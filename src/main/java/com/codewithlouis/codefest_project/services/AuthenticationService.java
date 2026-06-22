package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.dto.LoginResponseDto;
import com.codewithlouis.codefest_project.dto.LoginUserDto;
import com.codewithlouis.codefest_project.dto.RegisterUserDto;
import com.codewithlouis.codefest_project.model.RefreshToken;
import com.codewithlouis.codefest_project.model.Role;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

        if (userRepository.findByEmail(input.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setName(input.getName());
        user.setEmail(input.getEmail());
        user.setRole(input.getRole());; // or whatever your default is
        user.setPassword(passwordEncoder.encode(input.getPassword()));

        return userRepository.save(user);
    }

    public LoginResponseDto login(LoginUserDto input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getEmail(),
                        input.getPassword()
                )
        );

        User user = userRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(input.getEmail());

        return new LoginResponseDto(
                jwtService.generateToken(user),
                refreshToken.getToken(),
                jwtService.getExpirationTime()
        );
    }

    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        refreshTokenService.deleteByUser(user);
    }
}