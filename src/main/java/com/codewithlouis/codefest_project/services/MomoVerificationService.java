package com.codewithlouis.codefest_project.services;


import com.codewithlouis.codefest_project.configs.MomoConfig;
import com.codewithlouis.codefest_project.dto.MomoVerificationResponse;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class MomoVerificationService {

    private final MomoConfig momoConfig;
    private final MomoTokenService momoTokenService;
    private final RestTemplate restTemplate;
    private final UserRepository userRepository;

    public MomoVerificationResponse verifyAccount(String momoNumber) {
        if (momoConfig.mockMode) {
            return mockVerify(momoNumber);
        }

        boolean isActive;
        try {
            String accessToken = momoTokenService.getAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.set("Ocp-Apim-Subscription-Key", momoConfig.subscriptionKey);
            headers.set("X-Target-Environment", momoConfig.targetEnvironment);

            ResponseEntity<Void> response = restTemplate.exchange(
                    momoConfig.baseUrl + "/collection/v1_0/accountholder/msisdn/" + momoNumber + "/active",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Void.class
            );
            isActive = response.getStatusCode().is2xxSuccessful();
        } catch (HttpClientErrorException.NotFound e) {
            isActive = false;
        } catch (HttpServerErrorException e) {
            log.error("MoMo sandbox unavailable, falling back to mock: {}", e.getMessage());
            return mockVerify(momoNumber);
        }

        return finalizeVerification(momoNumber, isActive);
    }

    private MomoVerificationResponse mockVerify(String momoNumber) {
        boolean isActive = momoNumber != null
                && momoNumber.replaceAll("[^0-9]", "").matches("^(233|0)?(24|25|53|54|59)\\d{7}$");
        log.info("MoMo mock verification for {}: {}", momoNumber, isActive);
        return finalizeVerification(momoNumber, isActive);
    }

    private MomoVerificationResponse finalizeVerification(String momoNumber, boolean isActive) {
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