package com.codewithlouis.codefest_project.services;


import com.codewithlouis.codefest_project.request.PitchRequest;
import com.codewithlouis.codefest_project.model.*;
import com.codewithlouis.codefest_project.repository.PitchRepository;
import com.codewithlouis.codefest_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PitchService {

    private final PitchRepository pitchRepository;
    private final UserRepository userRepository;

    // Business owner creates a pitch
    public Pitch createPitch(PitchRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!owner.isGhanaCardVerified() || !owner.isMomoVerified()) {
            throw new RuntimeException("You must complete Ghana Card and MoMo verification before posting a pitch");
        }

        Pitch pitch = new Pitch();
        pitch.setOwner(owner);
        pitch.setBusinessName(request.getBusinessName());
        pitch.setDescription(request.getDescription());
        pitch.setVideoUrl(request.getVideoUrl());
        pitch.setMonthlyIncome(request.getMonthlyIncome());
        pitch.setAmountNeeded(request.getAmountNeeded());
        pitch.setOfferType(request.getOfferType());
        pitch.setOfferValue(request.getOfferValue());
        pitch.setLocation(request.getLocation());
        pitch.setIndustry(Industry.valueOf(request.getIndustry()));
        pitch.setStatus(PitchStatus.PENDING);

        return pitchRepository.save(pitch);
    }

    // Investors see all live pitches
    public List<Pitch> getLivePitches() {
        return pitchRepository.findByStatus(PitchStatus.LIVE);
    }

    // Get one pitch by ID
    public Pitch getPitchById(Integer id) {
        return pitchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pitch not found"));
    }

    // Update approvePitch to set expiry date
    public Pitch approvePitch(Integer id) {
        Pitch pitch = getPitchById(id);
        pitch.setStatus(PitchStatus.LIVE);
        pitch.setExpiresAt(LocalDateTime.now().plusDays(30));
        return pitchRepository.save(pitch);
    }

    // Add filter method
    public List<Pitch> filterPitches(String location, Industry industry, OfferType offerType,
                                     Double minAmount, Double maxAmount) {
        String industryStr = industry != null ? industry.name() : null;
        String offerTypeStr = offerType != null ? offerType.name() : null;
        return pitchRepository.filterPitches(location, industryStr, offerTypeStr, minAmount, maxAmount);
    }
    // Business owner sees their own pitches
    public List<Pitch> getMyPitches() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return pitchRepository.findByOwnerEmail(email);
    }


}