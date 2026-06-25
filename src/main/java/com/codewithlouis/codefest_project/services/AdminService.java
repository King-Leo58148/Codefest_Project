package com.codewithlouis.codefest_project.services;


import com.codewithlouis.codefest_project.model.*;
import com.codewithlouis.codefest_project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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

    // USERS
    @Cacheable("allUsers")
    public List<User> getAllUsers() {
        checkAdmin();
        return userRepository.findAll();
    }

    @CacheEvict(value = "allUsers", allEntries = true)
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

    @CacheEvict(value = "allUsers", allEntries = true)
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

    // PITCHES
    @Cacheable("allPitches")
    public List<Pitch> getAllPitches() {
        checkAdmin();
        return pitchRepository.findAll();
    }

    @Cacheable("pendingPitches")
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

    // DEALS
    @Cacheable("allDeals")
    public List<Deal> getAllDeals() {
        checkAdmin();
        return dealRepository.findAll();
    }

    @Cacheable(value = "dealsByStatus", key = "#status")
    public List<Deal> getDealsByStatus(DealStatus status) {
        checkAdmin();
        return dealRepository.findByStatus(status);
    }

    // REPAYMENTS
    @Cacheable("allRepayments")
    public List<Repayment> getAllRepayments() {
        checkAdmin();
        return repaymentRepository.findAll();
    }

    @Cacheable("missedRepayments")
    public List<Repayment> getMissedRepayments() {
        checkAdmin();
        return repaymentRepository.findByStatus(RepaymentStatus.MISSED);
    }
}