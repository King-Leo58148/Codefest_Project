package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.Deal;
import com.codewithlouis.codefest_project.model.NotificationType;
import com.codewithlouis.codefest_project.model.Repayment;
import com.codewithlouis.codefest_project.model.RepaymentStatus;
import com.codewithlouis.codefest_project.model.ReturnType;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.repository.RepaymentRepository;
import com.codewithlouis.codefest_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RepaymentService {

    private final RepaymentRepository repaymentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PaystackService paystackService;

    public List<Repayment> generateRepaymentSchedule(Deal deal) {
        List<Repayment> schedule = new ArrayList<>();

        ReturnType returnType = deal.getBid().getReturnType();
        int months = deal.getBid().getTimelineMonths();
        double amount = deal.getBid().getAmount();
        double returnValue = deal.getBid().getReturnValue();
        double monthlyIncome = deal.getPitch().getMonthlyIncome();

        if (returnType == ReturnType.EQUITY) {
            log.info("Deal {} is EQUITY; no repayment schedule generated", deal.getId());
            return schedule;
        }

        double monthlyPayment;

        if (returnType == ReturnType.FIXED) {
            double totalRepayment = amount + returnValue;
            monthlyPayment = totalRepayment / months;
        } else {
            monthlyPayment = monthlyIncome * (returnValue / 100);
        }

        for (int i = 1; i <= months; i++) {
            Repayment repayment = new Repayment();
            repayment.setDeal(deal);
            repayment.setAmount(Math.round(monthlyPayment * 100.0) / 100.0);
            repayment.setDueDate(LocalDate.now().plusMonths(i));
            repayment.setStatus(RepaymentStatus.PENDING);
            repayment.setInstallmentNumber(i);
            schedule.add(repayment);
        }

        return repaymentRepository.saveAll(schedule);
    }

    public List<Repayment> getRepaymentSchedule(Integer dealId) {
        return repaymentRepository.findByDealId(dealId);
    }

    public Map<String, Object> initiateRepaymentPayment(Integer dealId, Integer repaymentId) {
        User currentUser = getCurrentUser();
        Repayment repayment = getRepaymentForDeal(dealId, repaymentId);

        if (!repayment.getDeal().getOwner().getEmail().equals(currentUser.getEmail())) {
            throw new RuntimeException("Only the business owner can pay repayments");
        }

        Map<String, Object> response = paystackService.initializeRepayment(repayment);
        repayment.setPaystackRef((String) response.get("reference"));
        repaymentRepository.save(repayment);

        return response;
    }

    public Repayment verifyRepaymentPayment(Integer dealId, Integer repaymentId, String reference) {
        Repayment repayment = getRepaymentForDeal(dealId, repaymentId);

        if (repayment.getStatus() == RepaymentStatus.COLLECTED) {
            return repayment;
        }

        String ref = (reference != null && !reference.isBlank())
                ? reference
                : repayment.getPaystackRef();

        if (ref == null || ref.isBlank()) {
            throw new RuntimeException("No repayment payment reference found. Please start payment first.");
        }

        if (!paystackService.verifyPayment(ref)) {
            throw new RuntimeException("Repayment payment is not confirmed by Paystack yet.");
        }

        return markRepaymentCollected(repayment, ref);
    }

    public void handlePaystackCharge(String reference) {
        if (reference == null || reference.isBlank() || !reference.startsWith("NKOSO-REPAY-")) {
            return;
        }

        Repayment repayment = repaymentRepository.findByPaystackRef(reference).orElse(null);
        if (repayment == null || repayment.getStatus() == RepaymentStatus.COLLECTED) {
            return;
        }

        if (paystackService.verifyPayment(reference)) {
            markRepaymentCollected(repayment, reference);
        }
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void notifyDueRepayments() {
        List<Repayment> dueRepayments = repaymentRepository
                .findByStatusAndDueDateLessThanEqual(RepaymentStatus.PENDING, LocalDate.now());

        for (Repayment repayment : dueRepayments) {
            notificationService.createNotification(
                    repayment.getDeal().getOwner(),
                    NotificationType.REPAYMENT_DUE,
                    "Repayment Due",
                    "Your repayment of GHS " + repayment.getAmount() + " for deal #" + repayment.getDeal().getId() + " is due. Open Nkoso to pay with Paystack.",
                    repayment.getId()
            );
        }
    }

    private Repayment markRepaymentCollected(Repayment repayment, String reference) {
        repayment.setStatus(RepaymentStatus.COLLECTED);
        repayment.setPaystackRef(reference);
        repayment.setPaidAt(LocalDateTime.now());
        repayment.setCollectedAt(LocalDateTime.now());

        try {
            paystackService.disburseRepaymentToInvestor(repayment);
            repayment.setTransferredAt(LocalDateTime.now());
        } catch (Exception error) {
            log.error("Failed to transfer repayment {} to investor", repayment.getId(), error);
        }

        Repayment saved = repaymentRepository.save(repayment);

        notificationService.createNotification(
                repayment.getDeal().getInvestor(),
                NotificationType.REPAYMENT_COLLECTED,
                "Repayment Received",
                "GHS " + repayment.getAmount() + " repayment for " + repayment.getDeal().getPitch().getBusinessName() + " has been paid.",
                repayment.getId()
        );
        notificationService.createNotification(
                repayment.getDeal().getOwner(),
                NotificationType.REPAYMENT_COLLECTED,
                "Repayment Paid",
                "Your repayment of GHS " + repayment.getAmount() + " for deal #" + repayment.getDeal().getId() + " was confirmed.",
                repayment.getId()
        );

        return saved;
    }

    private Repayment getRepaymentForDeal(Integer dealId, Integer repaymentId) {
        Repayment repayment = repaymentRepository.findById(repaymentId)
                .orElseThrow(() -> new RuntimeException("Repayment not found"));
        if (!repayment.getDeal().getId().equals(dealId)) {
            throw new RuntimeException("Repayment does not belong to this deal");
        }
        return repayment;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
