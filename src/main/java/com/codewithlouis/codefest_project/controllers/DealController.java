package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.model.Deal;
import com.codewithlouis.codefest_project.model.Message;
import com.codewithlouis.codefest_project.model.Repayment;
import com.codewithlouis.codefest_project.services.DealService;
import com.codewithlouis.codefest_project.services.RepaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;
    private final RepaymentService repaymentService;

    @GetMapping("/{dealId}")
    public ResponseEntity<Deal> getDeal(@PathVariable Integer dealId) {
        return ResponseEntity.ok(dealService.getDeal(dealId));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Deal>> getMyDeals() {
        return ResponseEntity.ok(dealService.getMyDeals());
    }

    @PostMapping("/{dealId}/sign")
    public ResponseEntity<Deal> signDeal(@PathVariable Integer dealId) {
        return ResponseEntity.ok(dealService.signDeal(dealId));
    }

    @PostMapping("/{dealId}/messages")
    public ResponseEntity<Message> sendMessage(
            @PathVariable Integer dealId,
            @RequestBody MessageRequest request) {
        return ResponseEntity.ok(dealService.sendMessage(dealId, request.getContent()));
    }

    @GetMapping("/{dealId}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Integer dealId) {
        return ResponseEntity.ok(dealService.getMessages(dealId));
    }

    @Data
    static class MessageRequest {
        private String content;
    }

    @PostMapping("/{dealId}/pay")
    public ResponseEntity<Map<String, Object>> initiatePayment(@PathVariable Integer dealId) {
        return ResponseEntity.ok(dealService.initiatePayment(dealId));
    }

    @Data
    static class VerifyPaymentRequest {
        private String reference;
    }

    @PostMapping("/{dealId}/verify-payment")
    public ResponseEntity<Deal> verifyPayment(
            @PathVariable Integer dealId,
            @RequestBody(required = false) VerifyPaymentRequest body) {
        String reference = (body != null) ? body.getReference() : null;
        return ResponseEntity.ok(dealService.verifyPayment(dealId, reference));
    }

    @PostMapping("/{dealId}/repayments/{repaymentId}/pay")
    public ResponseEntity<Map<String, Object>> initiateRepaymentPayment(
            @PathVariable Integer dealId,
            @PathVariable Integer repaymentId) {
        return ResponseEntity.ok(repaymentService.initiateRepaymentPayment(dealId, repaymentId));
    }

    @PostMapping("/{dealId}/repayments/{repaymentId}/verify-payment")
    public ResponseEntity<Repayment> verifyRepaymentPayment(
            @PathVariable Integer dealId,
            @PathVariable Integer repaymentId,
            @RequestBody(required = false) VerifyPaymentRequest body) {
        String reference = (body != null) ? body.getReference() : null;
        return ResponseEntity.ok(repaymentService.verifyRepaymentPayment(dealId, repaymentId, reference));
    }

    // Paystack calls this directly; it must be permitAll() in SecurityConfiguration.
    @PostMapping("/webhook/paystack")
    public ResponseEntity<Void> paystackWebhook(@RequestBody Map<String, Object> payload) {
        dealService.handlePaystackWebhook(payload);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{dealId}/repayments")
    public ResponseEntity<List<Repayment>> getRepayments(@PathVariable Integer dealId) {
        return ResponseEntity.ok(repaymentService.getRepaymentSchedule(dealId));
    }
}
