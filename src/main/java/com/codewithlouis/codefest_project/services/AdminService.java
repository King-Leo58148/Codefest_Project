package com.codewithlouis.codefest_project.services;


import com.codewithlouis.codefest_project.model.*;
import com.codewithlouis.codefest_project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PitchRepository pitchRepository;
    private final DealRepository dealRepository;
    private final RepaymentRepository repaymentRepository;
    private final NotificationService notificationService;

    private void checkAdmin() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Access denied — Admins only");
        }
    }

    // USERS — not cached: admin views must always reflect current DB state,
    // and caching here also skipped the checkAdmin() guard on every cache hit.
    public List<User> getAllUsers() {
        checkAdmin();
        return userRepository.findAll();
    }

    public User suspendUser(Integer userId) {
        checkAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setSuspended(true);
        notificationService.createNotification(
                user,
                NotificationType.PITCH_APPROVED,
                "Account Suspended",
                "Your account has been suspended. Contact support for more information.",
                userId
        );
        return userRepository.save(user);
    }

    public User unsuspendUser(Integer userId) {
        checkAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setSuspended(false);
        notificationService.createNotification(
                user,
                NotificationType.PITCH_APPROVED,
                "Account Reinstated",
                "Your account has been reinstated. You can now access the platform.",
                userId
        );
        return userRepository.save(user);
    }

    // PITCHES — deliberately not cached. A newly submitted pitch has to appear in
    // the review queue straight away, and caching here also skipped checkAdmin()
    // on every cache hit.
    public List<Pitch> getAllPitches() {
        checkAdmin();
        return pitchRepository.findAll();
    }

    public List<Pitch> getPendingPitches() {
        checkAdmin();
        return pitchRepository.findByStatus(PitchStatus.PENDING);
    }

    public Pitch rejectPitch(Integer pitchId) {
        checkAdmin();
        Pitch pitch = pitchRepository.findById(pitchId)
                .orElseThrow(() -> new RuntimeException("Pitch not found"));
        pitch.setStatus(PitchStatus.REJECTED);
        notificationService.createNotification(
                pitch.getOwner(),
                NotificationType.PITCH_APPROVED,
                "Pitch Rejected",
                "Your pitch '" + pitch.getBusinessName() + "' was rejected by admin.",
                pitchId
        );
        return pitchRepository.save(pitch);
    }

    // DEALS — not cached: deal status changes in real-time (sign, pay, approve)
    public List<Deal> getAllDeals() {
        checkAdmin();
        return dealRepository.findAll();
    }

    public List<Deal> getDealsByStatus(DealStatus status) {
        checkAdmin();
        return dealRepository.findByStatus(status);
    }

    // REPAYMENTS — not cached: repayment status is time-sensitive
    public List<Repayment> getAllRepayments() {
        checkAdmin();
        return repaymentRepository.findAll();
    }

    public List<Repayment> getMissedRepayments() {
        checkAdmin();
        return repaymentRepository.findByStatus(RepaymentStatus.MISSED);
    }
}