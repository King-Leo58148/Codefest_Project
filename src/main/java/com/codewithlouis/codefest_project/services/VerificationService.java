package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.repository.UserRepository;
import com.codewithlouis.codefest_project.dto.VerificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;

    public VerificationResponse verifyGhanaCard(String cardNumber, MultipartFile cardImage) {

        // Upload image to Cloudinary regardless of verification result
        String imageUrl = cloudinaryService.uploadImage(cardImage, "nkoso/ghana-cards");

        // TODO: Replace this block with real Appruve API call in production
        // For now we mock the verification — always returns verified
        boolean isVerified = mockVerification(cardNumber);

        if (!isVerified) {
            return VerificationResponse.builder()
                    .verified(false)
                    .cardNumber(cardNumber)
                    .imageUrl(imageUrl)
                    .message("Ghana Card verification failed")
                    .build();
        }

        // Update the user record with Ghana Card details
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setGhanaCardNumber(cardNumber);
        user.setGhanaCardImageUrl(imageUrl);
        user.setGhanaCardVerified(true);
        userRepository.save(user);

        return VerificationResponse.builder()
                .verified(true)
                .cardNumber(cardNumber)
                .imageUrl(imageUrl)
                .message("Ghana Card verified successfully")
                .build();
    }

    private boolean mockVerification(String cardNumber) {
        // Mock logic — accepts any card number in format GHA-XXXXXXXXX-X
        return cardNumber != null && cardNumber.matches("GHA-\\d{9}-\\d");
    }
}