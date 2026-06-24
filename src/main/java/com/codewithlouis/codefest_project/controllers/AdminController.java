package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.model.*;
import com.codewithlouis.codefest_project.services.AdminService;
import com.codewithlouis.codefest_project.services.PitchService;
import com.codewithlouis.codefest_project.services.DealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final PitchService pitchService;
    private final DealService dealService;

    // USERS
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{userId}/suspend")
    public ResponseEntity<User> suspendUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(adminService.suspendUser(userId));
    }

    @PutMapping("/users/{userId}/unsuspend")
    public ResponseEntity<User> unsuspendUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(adminService.unsuspendUser(userId));
    }

    // PITCHES
    @GetMapping("/pitches")
    public ResponseEntity<List<Pitch>> getAllPitches() {
        return ResponseEntity.ok(adminService.getAllPitches());
    }

    @GetMapping("/pitches/pending")
    public ResponseEntity<List<Pitch>> getPendingPitches() {
        return ResponseEntity.ok(adminService.getPendingPitches());
    }

    @PutMapping("/pitches/{id}/approve")
    public ResponseEntity<Pitch> approvePitch(@PathVariable Integer id) {
        return ResponseEntity.ok(pitchService.approvePitch(id));
    }

    @PutMapping("/pitches/{id}/reject")
    public ResponseEntity<Pitch> rejectPitch(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.rejectPitch(id));
    }

    // DEALS
    @GetMapping("/deals")
    public ResponseEntity<List<Deal>> getAllDeals() {
        return ResponseEntity.ok(adminService.getAllDeals());
    }

    @GetMapping("/deals/pending-mfi")
    public ResponseEntity<List<Deal>> getPendingMfiDeals() {
        return ResponseEntity.ok(adminService.getDealsByStatus(DealStatus.PENDING_MFI));
    }

    @GetMapping("/deals/active")
    public ResponseEntity<List<Deal>> getActiveDeals() {
        return ResponseEntity.ok(adminService.getDealsByStatus(DealStatus.ACTIVE));
    }

    @PutMapping("/deals/{dealId}/approve-mfi")
    public ResponseEntity<Deal> approveMfi(@PathVariable Integer dealId) {
        return ResponseEntity.ok(dealService.approveMfi(dealId));
    }

    // REPAYMENTS
    @GetMapping("/repayments")
    public ResponseEntity<List<Repayment>> getAllRepayments() {
        return ResponseEntity.ok(adminService.getAllRepayments());
    }

    @GetMapping("/repayments/missed")
    public ResponseEntity<List<Repayment>> getMissedRepayments() {
        return ResponseEntity.ok(adminService.getMissedRepayments());
    }
}