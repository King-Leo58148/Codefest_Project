package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.model.Deal;
import com.codewithlouis.codefest_project.model.Message;
import com.codewithlouis.codefest_project.services.DealService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;

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

    @PutMapping("/{dealId}/approve-mfi")
    public ResponseEntity<Deal> approveMfi(@PathVariable Integer dealId) {
        return ResponseEntity.ok(dealService.approveMfi(dealId));
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
}