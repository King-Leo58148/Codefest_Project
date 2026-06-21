package com.codewithlouis.codefest_project.controllers;


import com.codewithlouis.codefest_project.model.Bid;
import com.codewithlouis.codefest_project.request.BidRequest;
import com.codewithlouis.codefest_project.services.BidService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    @PostMapping("/pitches/{pitchId}/bids")
    public ResponseEntity<Bid> placeBid(
            @PathVariable Integer pitchId,
            @Valid @RequestBody BidRequest request) {
        return ResponseEntity.ok(bidService.placeBid(pitchId, request));
    }

    @GetMapping("/pitches/{pitchId}/bids")
    public ResponseEntity<List<Bid>> getBidsForPitch(@PathVariable Integer pitchId) {
        return ResponseEntity.ok(bidService.getBidsForPitch(pitchId));
    }

    @GetMapping("/bids/mine")
    public ResponseEntity<List<Bid>> getMyBids() {
        return ResponseEntity.ok(bidService.getMyBids());
    }

    @PutMapping("/bids/{bidId}/counter")
    public ResponseEntity<Bid> counterBid(
            @PathVariable Integer bidId,
            @Valid @RequestBody BidRequest request) {
        return ResponseEntity.ok(bidService.counterBid(bidId, request));
    }

    @PutMapping("/bids/{bidId}/accept")
    public ResponseEntity<Bid> acceptBid(@PathVariable Integer bidId) {
        return ResponseEntity.ok(bidService.acceptBid(bidId));
    }

    @PutMapping("/bids/{bidId}/reject")
    public ResponseEntity<Bid> rejectBid(@PathVariable Integer bidId) {
        return ResponseEntity.ok(bidService.rejectBid(bidId));
    }
}