package com.codewithlouis.codefest_project.services;


import com.codewithlouis.codefest_project.model.*;
import com.codewithlouis.codefest_project.repository.RepaymentRepository;
import com.codewithlouis.codefest_project.repository.DealRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RepaymentService {

    private final RepaymentRepository repaymentRepository;
    private final DealRepository dealRepository;
    private final MomoVerificationService momoVerificationService;

    // Called when deal becomes ACTIVE — generates full repayment schedule
    public List<Repayment> generateRepaymentSchedule(Deal deal) {
        List<Repayment> schedule = new ArrayList<>();

        ReturnType returnType = deal.getBid().getReturnType();
        int months = deal.getBid().getTimelineMonths();
        double amount = deal.getBid().getAmount();
        double returnValue = deal.getBid().getReturnValue();
        double monthlyIncome = deal.getPitch().getMonthlyIncome();

        // EQUITY — no repayment schedule
        if (returnType == ReturnType.EQUITY) {
            log.info("Deal {} is EQUITY — no repayment schedule generated", deal.getId());
            return schedule;
        }

        double monthlyPayment;

        if (returnType == ReturnType.FIXED) {
            // Total = principal + fixed return, spread over months
            double totalRepayment = amount + returnValue;
            monthlyPayment = totalRepayment / months;
        } else {
            // REVENUE_SHARE — percentage of monthly income
            monthlyPayment = monthlyIncome * (returnValue / 100);
        }

        // Generate one repayment per month
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

    // View repayment schedule for a deal
    public List<Repayment> getRepaymentSchedule(Integer dealId) {
        return repaymentRepository.findByDealId(dealId);
    }

    // Runs every day at 8AM — collects due repayments via MoMo
    @Scheduled(cron = "0 0 8 * * *")
    public void collectDueRepayments() {
        List<Repayment> dueRepayments = repaymentRepository
                .findByStatusAndDueDateLessThanEqual(RepaymentStatus.PENDING, LocalDate.now());

        for (Repayment repayment : dueRepayments) {
            try {
                // Request payment from business owner's MoMo
                String momoNumber = repayment.getDeal().getOwner().getMomoNumber();
                String ref = requestMomoPayment(momoNumber, repayment.getAmount(), repayment.getDeal().getId());

                repayment.setStatus(RepaymentStatus.COLLECTED);
                repayment.setMomoRef(ref);
                repayment.setCollectedAt(LocalDateTime.now());
                repaymentRepository.save(repayment);

                log.info("Collected repayment {} for deal {}", repayment.getId(), repayment.getDeal().getId());

            } catch (Exception e) {
                repayment.setStatus(RepaymentStatus.MISSED);
                repaymentRepository.save(repayment);
                log.error("Failed to collect repayment {} — marked as MISSED", repayment.getId());
            }
        }
    }

    private String requestMomoPayment(String momoNumber, Double amount, Integer dealId) {
        // TODO: Replace with real MTN MoMo RequestToPay API call in production
        // For sandbox — mock the collection since MTN sandbox doesn't process real collections
        log.info("Requesting MoMo payment of {} from {} for deal {}", amount, momoNumber, dealId);
        return "MOMO-REF-" + dealId + "-" + System.currentTimeMillis();
    }
}