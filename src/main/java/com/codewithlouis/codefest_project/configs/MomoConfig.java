package com.codewithlouis.codefest_project.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class MomoConfig {

    @Value("${momo.subscription-key}")
    public String subscriptionKey;

    @Value("${momo.api-user}")
    public String apiUser;

    @Value("${momo.api-key}")
    public String apiKey;

    @Value("${momo.base-url}")
    public String baseUrl;

    @Value("${momo.target-environment}")
    public String targetEnvironment;

    @Value("${momo.mock-mode:false}")
    public boolean mockMode;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}