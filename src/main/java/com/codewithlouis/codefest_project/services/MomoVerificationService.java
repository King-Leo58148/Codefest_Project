package com.codewithlouis.codefest_project.services;


import com.codewithlouis.codefest_project.configs.MomoConfig;
import com.codewithlouis.codefest_project.dto.MomoVerificationResponse;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class MomoVerificationService {

    private final MomoConfig momoConfig;
    private final MomoTokenService momoTokenService;
    private final RestTemplate restTemplate;
    private final UserRepository userRepository;

    public MomoVerificationResponse verifyAccount(String momoNumber) {
        String accessToken = momoTokenService.getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.set("Ocp-Apim-Subscription-Key", momoConfig.subscriptionKey);
        headers.set("X-Target-Environment", momoConfig.targetEnvironment);

        boolean isActive;
        try {
            ResponseEntity<Void> response = restTemplate.exchange(
                    momoConfig.baseUrl + "/collection/v1_0/accountholder/msisdn/" + momoNumber + "/active",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Void.class
            );
            isActive = response.getStatusCode().is2xxSuccessful();
        } catch (HttpClientErrorException.NotFound e) {
            isActive = false;
        }

        if (isActive) {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setMomoNumber(momoNumber);
            user.setMomoVerified(true);
            userRepository.save(user);
        }

        return MomoVerificationResponse.builder()
                .verified(isActive)
                .momoNumber(momoNumber)
                .message(isActive ? "MoMo account verified successfully" : "MoMo number not found or inactive")
                .build();
    }
}