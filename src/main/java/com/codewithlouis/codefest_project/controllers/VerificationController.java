package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.request.MomoVerificationRequest;
import com.codewithlouis.codefest_project.dto.MomoVerificationResponse;
import com.codewithlouis.codefest_project.services.MomoVerificationService;
import com.codewithlouis.codefest_project.services.VerificationService;
import com.codewithlouis.codefest_project.dto.VerificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/verify")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping(value = "/ghana-card", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VerificationResponse> verifyGhanaCard(
            @RequestPart("cardNumber") String cardNumber,
            @RequestPart("cardImage") MultipartFile cardImage
    ) {
        return ResponseEntity.ok(
                verificationService.verifyGhanaCard(cardNumber, cardImage)
        );
    }
    private final MomoVerificationService momoVerificationService;

    @PostMapping("/momo")
    public ResponseEntity<MomoVerificationResponse> verifyMomo(
            @RequestBody MomoVerificationRequest request) {
        return ResponseEntity.ok(momoVerificationService.verifyAccount(request.getMomoNumber()));
    }
}