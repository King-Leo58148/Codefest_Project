package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.dto.ProfileUpdateRequest;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User updateProfile(String authenticatedEmail, ProfileUpdateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Profile update is required");
        }

        User user = userRepository.findByEmail(normalizeEmail(authenticatedEmail))
                .orElseThrow(() -> new RuntimeException("User not found"));

        updateName(user, request.getName());
        updatePassword(user, request);
        updateMomo(user, request.getMomoNumber());

        return userRepository.save(user);
    }

    private void updateName(User user, String name) {
        if (StringUtils.hasText(name)) {
            user.setName(name.trim());
        }
    }

    private void updatePassword(User user, ProfileUpdateRequest request) {
        boolean currentProvided = StringUtils.hasText(request.getCurrentPassword());
        boolean newProvided = StringUtils.hasText(request.getNewPassword());
        boolean confirmProvided = StringUtils.hasText(request.getConfirmPassword());

        if (!currentProvided && !newProvided && !confirmProvided) {
            return;
        }

        if (!currentProvided || !newProvided || !confirmProvided) {
            throw new IllegalArgumentException(
                    "Current password, new password, and confirm password are required to change password"
            );
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    }

    private void updateMomo(User user, String momoNumber) {
        if (!StringUtils.hasText(momoNumber)) {
            return;
        }

        String normalizedMomoNumber = normalizeDigits(momoNumber);
        if (normalizedMomoNumber.length() != 10) {
            throw new IllegalArgumentException("MoMo number must be exactly 10 digits");
        }

        String existingNormalizedMomo = normalizeDigits(user.getMomoNumber());
        boolean changed = !normalizedMomoNumber.equals(existingNormalizedMomo);

        user.setMomoNumber(normalizedMomoNumber);
        if (changed) {
            user.setMomoVerified(false);
        }
    }

    private String normalizeEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeDigits(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("\\D", "");
    }
}
