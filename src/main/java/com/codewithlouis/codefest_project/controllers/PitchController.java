package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.dto.PitchRequest;
import com.codewithlouis.codefest_project.model.Industry;
import com.codewithlouis.codefest_project.model.OfferType;
import com.codewithlouis.codefest_project.model.Pitch;
import com.codewithlouis.codefest_project.services.PitchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pitches")
@RequiredArgsConstructor
public class PitchController {

    private final PitchService pitchService;

    @PostMapping
    public ResponseEntity<Pitch> createPitch(@Valid @RequestBody PitchRequest request) {
        return ResponseEntity.ok(pitchService.createPitch(request));
    }

    @GetMapping
    public ResponseEntity<List<Pitch>> getLivePitches() {
        return ResponseEntity.ok(pitchService.getLivePitches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pitch> getPitch(@PathVariable Integer id) {
        return ResponseEntity.ok(pitchService.getPitchById(id));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Pitch>> getMyPitches() {
        return ResponseEntity.ok(pitchService.getMyPitches());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Pitch> approvePitch(@PathVariable Integer id) {
        return ResponseEntity.ok(pitchService.approvePitch(id));
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
}