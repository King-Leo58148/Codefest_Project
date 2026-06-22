package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.request.PitchRequest;
import com.codewithlouis.codefest_project.model.Industry;
import com.codewithlouis.codefest_project.model.OfferType;
import com.codewithlouis.codefest_project.model.Pitch;
import com.codewithlouis.codefest_project.services.PitchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/pitches")
@RequiredArgsConstructor
public class PitchController {

    private final PitchService pitchService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Pitch> createPitch(
            @RequestPart("data") @Valid PitchRequest request,
            @RequestPart("video") MultipartFile video
    ) {
        return ResponseEntity.ok(pitchService.createPitch(request, video));
    }

    @GetMapping
    public ResponseEntity<List<Pitch>> getLivePitches() {
        return ResponseEntity.ok(pitchService.getLivePitches());
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Pitch>> getMyPitches() {
        return ResponseEntity.ok(pitchService.getMyPitches());
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Pitch>> filterPitches(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Industry industry,
            @RequestParam(required = false) OfferType offerType,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount
    ) {
        return ResponseEntity.ok(pitchService.filterPitches(location, industry, offerType, minAmount, maxAmount));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pitch> getPitch(@PathVariable Integer id) {
        return ResponseEntity.ok(pitchService.getPitchById(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Pitch> approvePitch(@PathVariable Integer id) {
        return ResponseEntity.ok(pitchService.approvePitch(id));
    }
}