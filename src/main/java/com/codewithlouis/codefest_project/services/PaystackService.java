package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.Deal;
import com.codewithlouis.codefest_project.model.DealStatus;
import com.codewithlouis.codefest_project.model.Repayment;
import com.codewithlouis.codefest_project.model.RepaymentStatus;
import com.codewithlouis.codefest_project.repository.DealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaystackService {

    @Value("${paystack.secret-key}")
    private String secretKey;

    @Value("${paystack.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate;
    private final DealRepository dealRepository;

    // Step 1 - initialize payment, returns authorization URL.
    public Map<String, Object> initializePayment(Deal deal) {
        if (deal.getStatus() != DealStatus.PAYMENT_PENDING) {
            throw new RuntimeException("Deal is not ready for payment");
        }

        double dealAmount = deal.getBid().getAmount();
        double platformFee = calculatePlatformFee(dealAmount);
        double totalAmount = dealAmount + platformFee;

        long amountInPesewas = toPesewas(totalAmount);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + secretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("email", deal.getInvestor().getEmail());
        body.put("amount", amountInPesewas);
        body.put("currency", "GHS");
        body.put("reference", "NKOSO-DEAL-" + deal.getId() + "-" + System.currentTimeMillis());
        body.put("metadata", Map.of(
                "deal_id", deal.getId(),
                "investor", deal.getInvestor().getName(),
                "business", deal.getPitch().getBusinessName(),
                "platform_fee", platformFee
        ));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/transaction/initialize",
                HttpMethod.POST,
                request,
                Map.class
        );

        Map<String, Object> responseData = (Map<String, Object>) response.getBody().get("data");

        String reference = (String) responseData.get("reference");
        deal.setPaystackRef(reference);
        deal.setPlatformFee(platformFee);
        deal.setNetDisbursementAmount(dealAmount);
        dealRepository.save(deal);

        return responseData;
    }

    public Map<String, Object> initializeRepayment(Repayment repayment) {
        if (repayment.getStatus() != RepaymentStatus.PENDING) {
            throw new RuntimeException("This repayment is not pending");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + secretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String reference = "NKOSO-REPAY-" + repayment.getId() + "-" + System.currentTimeMillis();
        Map<String, Object> body = new HashMap<>();
        body.put("email", repayment.getDeal().getOwner().getEmail());
        body.put("amount", toPesewas(repayment.getAmount()));
        body.put("currency", "GHS");
        body.put("reference", reference);
        body.put("metadata", Map.of(
                "deal_id", repayment.getDeal().getId(),
                "repayment_id", repayment.getId(),
                "business", repayment.getDeal().getPitch().getBusinessName(),
                "investor", repayment.getDeal().getInvestor().getName()
        ));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/transaction/initialize",
                HttpMethod.POST,
                request,
                Map.class
        );

        return (Map<String, Object>) response.getBody().get("data");
    }

    // Step 2 - verify payment after investor pays.
    public boolean verifyPayment(String reference) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + secretKey);

        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/transaction/verify/" + reference,
                HttpMethod.GET,
                request,
                Map.class
        );

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        String status = (String) data.get("status");

        return "success".equals(status);
    }

    public void disburseFunds(Deal deal) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + secretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> recipientBody = new HashMap<>();
        recipientBody.put("type", "mobile_money");
        recipientBody.put("name", deal.getOwner().getName());
        recipientBody.put("account_number", deal.getOwner().getMomoNumber());
        recipientBody.put("bank_code", "MTN");
        recipientBody.put("currency", "GHS");

        HttpEntity<Map<String, Object>> recipientRequest = new HttpEntity<>(recipientBody, headers);

        ResponseEntity<Map> recipientResponse = restTemplate.exchange(
                baseUrl + "/transferrecipient",
                HttpMethod.POST,
                recipientRequest,
                Map.class
        );

        Map<String, Object> recipientData = (Map<String, Object>) recipientResponse.getBody().get("data");
        String recipientCode = (String) recipientData.get("recipient_code");

        double disburseAmount = deal.getNetDisbursementAmount() != null
                ? deal.getNetDisbursementAmount()
                : deal.getBid().getAmount();
        long amountInPesewas = toPesewas(disburseAmount);
        Map<String, Object> transferBody = new HashMap<>();
        transferBody.put("source", "balance");
        transferBody.put("amount", amountInPesewas);
        transferBody.put("recipient", recipientCode);
        transferBody.put("reason", "Nkoso deal disbursement - Deal #" + deal.getId());
        transferBody.put("reference", deal.getPaystackRef() + "-DISB");

        HttpEntity<Map<String, Object>> transferRequest = new HttpEntity<>(transferBody, headers);

        restTemplate.exchange(
                baseUrl + "/transfer",
                HttpMethod.POST,
                transferRequest,
                Map.class
        );
    }

    public void disburseRepaymentToInvestor(Repayment repayment) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + secretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> recipientBody = new HashMap<>();
        recipientBody.put("type", "mobile_money");
        recipientBody.put("name", repayment.getDeal().getInvestor().getName());
        recipientBody.put("account_number", repayment.getDeal().getInvestor().getMomoNumber());
        recipientBody.put("bank_code", "MTN");
        recipientBody.put("currency", "GHS");

        ResponseEntity<Map> recipientResponse = restTemplate.exchange(
                baseUrl + "/transferrecipient",
                HttpMethod.POST,
                new HttpEntity<>(recipientBody, headers),
                Map.class
        );

        Map<String, Object> recipientData = (Map<String, Object>) recipientResponse.getBody().get("data");
        String recipientCode = (String) recipientData.get("recipient_code");

        Map<String, Object> transferBody = new HashMap<>();
        transferBody.put("source", "balance");
        transferBody.put("amount", toPesewas(repayment.getAmount()));
        transferBody.put("recipient", recipientCode);
        transferBody.put("reason", "Nkoso repayment - Deal #" + repayment.getDeal().getId());
        transferBody.put("reference", repayment.getPaystackRef() + "-REPAY-TRANSFER");

        restTemplate.exchange(
                baseUrl + "/transfer",
                HttpMethod.POST,
                new HttpEntity<>(transferBody, headers),
                Map.class
        );
    }

    public double calculatePlatformFee(double amount) {
        return Math.min(amount * 0.01, 100.0);
    }

    private long toPesewas(double amount) {
        return Math.round(amount * 100);
    }
}
