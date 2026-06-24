package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.request.PitchRequest;
import com.codewithlouis.codefest_project.model.*;
import com.codewithlouis.codefest_project.repository.PitchRepository;
import com.codewithlouis.codefest_project.repository.UserRepository;
import com.codewithlouis.codefest_project.services.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PitchService {

    private final PitchRepository pitchRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final NotificationService notificationService;

    public Pitch createPitch(PitchRequest request, MultipartFile video) {
        // 1. Auth check
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Verification checks
        if (!owner.isGhanaCardVerified() || !owner.isMomoVerified()) {
            throw new RuntimeException("You must complete Ghana Card and MoMo verification before posting a pitch");
        }
        if (owner.getRole() != Role.OWNER && owner.getRole() != Role.BOTH) {
            throw new RuntimeException("Only business owners can post a pitch");
        }

        // 3. Video is required — upload to Cloudinary
        if (video == null || video.isEmpty()) {
            throw new RuntimeException("A 60-second pitch video is required");
        }
        String videoUrl = cloudinaryService.uploadVideo(video, "nkoso/pitch-videos");

        // 4. Build and save pitch
        Pitch pitch = new Pitch();
        pitch.setOwner(owner);
        pitch.setBusinessName(request.getBusinessName());
        pitch.setDescription(request.getDescription());
        pitch.setVideoUrl(videoUrl);  // ✅ always from Cloudinary, never null
        pitch.setMonthlyIncome(request.getMonthlyIncome());
        pitch.setAmountNeeded(request.getAmountNeeded());
        pitch.setOfferType(OfferType.valueOf(request.getOfferType()));
        pitch.setOfferValue(request.getOfferValue());
        pitch.setLocation(request.getLocation());
        pitch.setIndustry(Industry.valueOf(request.getIndustry()));
        pitch.setStatus(PitchStatus.PENDING);

        return pitchRepository.save(pitch);
    }

    public List<Pitch> getLivePitches() {
        return pitchRepository.findByStatus(PitchStatus.LIVE);
    }

    public Pitch getPitchById(Integer id) {
        return pitchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pitch not found"));
    }

    public Pitch approvePitch(Integer id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only admins can approve pitches");
        }

        Pitch pitch = getPitchById(id);
        pitch.setStatus(PitchStatus.LIVE);
        pitch.setExpiresAt(LocalDateTime.now().plusDays(30));

        notificationService.createNotification(
                pitch.getOwner(),
                NotificationType.PITCH_APPROVED,
                "Pitch Approved",
                "Your pitch '" + pitch.getBusinessName() + "' has been approved and is now live.",
                pitch.getId()
        );

        return pitchRepository.save(pitch);
    }

    public List<Pitch> filterPitches(String location, Industry industry, OfferType offerType,
                                     Double minAmount, Double maxAmount) {
        String industryStr = industry != null ? industry.name() : null;
        String offerTypeStr = offerType != null ? offerType.name() : null;
        return pitchRepository.filterPitches(location, industryStr, offerTypeStr, minAmount, maxAmount);
    }

    public List<Pitch> getMyPitches() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return pitchRepository.findByOwnerEmail(email);
    }
}