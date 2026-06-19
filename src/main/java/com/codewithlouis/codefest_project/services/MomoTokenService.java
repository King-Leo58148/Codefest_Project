package com.codewithlouis.codefest_project.services;


import com.codewithlouis.codefest_project.configs.MomoConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MomoTokenService {

    private final MomoConfig momoConfig;
    private final RestTemplate restTemplate;

    public String getAccessToken() {
        String credentials = momoConfig.apiUser + ":" + momoConfig.apiKey;
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encoded);
        headers.set("Ocp-Apim-Subscription-Key", momoConfig.subscriptionKey);

        ResponseEntity<Map> response = restTemplate.exchange(
                momoConfig.baseUrl + "/collection/token/",
                HttpMethod.POST,
                new HttpEntity<>(headers),
                Map.class
        );

        return (String) response.getBody().get("access_token");
    }
}