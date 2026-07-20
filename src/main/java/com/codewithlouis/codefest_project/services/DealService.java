package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.*;
import com.codewithlouis.codefest_project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final PitchRepository pitchRepository;
    private final MessageRepository messageRepository;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;
    private final RepaymentService repaymentService;
    private final NotificationService notificationService;
    private final PaystackService paystackService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Deal createDeal(Integer bidId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        if (dealRepository.findByBidId(bidId).isPresent()) {
            throw new RuntimeException("Deal already exists for this bid");
        }

        Deal deal = new Deal();
        deal.setBid(bid);
        deal.setPitch(bid.getPitch());
        deal.setOwner(bid.getPitch().getOwner());
        deal.setInvestor(bid.getInvestor());
        deal.setStatus(DealStatus.PENDING_SIGNATURES);

        Deal saved = dealRepository.save(deal);

        notificationService.createNotification(
                bid.getPitch().getOwner(),
                NotificationType.DEAL_CREATED,
                "Deal Room Open",
                "A deal room has been created for " + bid.getPitch().getBusinessName() + ". Please sign to proceed.",
                saved.getId()
        );
        notificationService.createNotification(
                bid.getInvestor(),
                NotificationType.DEAL_CREATED,
                "Deal Room Open",
                "A deal room has been created for " + bid.getPitch().getBusinessName() + ". Please sign to proceed.",
                saved.getId()
        );

        return saved;
    }

    public Deal getDeal(Integer dealId) {
        User currentUser = getCurrentUser();
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (!deal.getOwner().getEmail().equals(currentUser.getEmail()) &&
                !deal.getInvestor().getEmail().equals(currentUser.getEmail()) &&
                currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("You are not part of this deal");
        }

        return deal;
    }

    public List<Deal> getMyDeals() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.OWNER) {
            return dealRepository.findByOwnerEmail(currentUser.getEmail());
        } else if (currentUser.getRole() == Role.INVESTOR) {
            return dealRepository.findByInvestorEmail(currentUser.getEmail());
        } else {
            List<Deal> deals = dealRepository.findByOwnerEmail(currentUser.getEmail());
            deals.addAll(dealRepository.findByInvestorEmail(currentUser.getEmail()));
            return deals;
        }
    }

    @Transactional
    public Deal signDeal(Integer dealId) {
        User currentUser = getCurrentUser();

        Deal deal = dealRepository.findByIdForUpdate(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (!deal.getOwner().getEmail().equals(currentUser.getEmail()) &&
                !deal.getInvestor().getEmail().equals(currentUser.getEmail())) {
            throw new RuntimeException("You are not part of this deal");
        }

        if (deal.getStatus() != DealStatus.PENDING_SIGNATURES) {
            throw new RuntimeException("This deal is not pending signatures");
        }

        if (currentUser.getEmail().equals(deal.getOwner().getEmail())) {
            deal.setOwnerSigned(true);
        } else if (currentUser.getEmail().equals(deal.getInvestor().getEmail())) {
            deal.setInvestorSigned(true);
        }

        User otherParty = currentUser.getEmail().equals(deal.getOwner().getEmail())
                ? deal.getInvestor()
                : deal.getOwner();

        notificationService.createNotification(
                otherParty,
                NotificationType.DEAL_SIGNED,
                "Deal Signed",
                currentUser.getName() + " has signed the deal for " + deal.getPitch().getBusinessName(),
                deal.getId()
        );

        if (deal.isOwnerSigned() && deal.isInvestorSigned()) {
            deal.setStatus(DealStatus.PENDING_MFI);
            emailService.sendMfiNotification(deal);
        }

        return dealRepository.save(deal);
    }

    public Deal approveMfi(Integer dealId) {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only admins can approve MFI");
        }

        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (deal.getStatus() != DealStatus.PENDING_MFI) {
            throw new RuntimeException("This deal is not pending MFI review");
        }

        deal.setMfiApproved(true);
        deal.setStatus(DealStatus.PAYMENT_PENDING);

        notificationService.createNotification(
                deal.getInvestor(),
                NotificationType.MFI_APPROVED,
                "MFI Approved",
                "The deal for " + deal.getPitch().getBusinessName() + " has been approved. Please proceed with payment.",
                deal.getId()
        );

        return dealRepository.save(deal);
    }

    public Deal rejectMfi(Integer dealId) {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only admins can reject MFI");
        }

        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (deal.getStatus() != DealStatus.PENDING_MFI) {
            throw new RuntimeException("This deal is not pending MFI review");
        }

        deal.setMfiApproved(false);
        deal.setStatus(DealStatus.CANCELLED);

        notificationService.createNotification(
                deal.getOwner(),
                NotificationType.MFI_APPROVED,
                "Deal Rejected",
                "The deal for " + deal.getPitch().getBusinessName() + " was rejected during MFI review.",
                deal.getId()
        );
        notificationService.createNotification(
                deal.getInvestor(),
                NotificationType.MFI_APPROVED,
                "Deal Rejected",
                "The deal for " + deal.getPitch().getBusinessName() + " was rejected during MFI review.",
                deal.getId()
        );

        return dealRepository.save(deal);
    }

    public Message sendMessage(Integer dealId, String content) {
        User sender = getCurrentUser();
        Deal deal = getDeal(dealId);

        Message message = new Message();
        message.setDeal(deal);
        message.setSender(sender);
        message.setContent(content);

        Message saved = messageRepository.save(message);

        messagingTemplate.convertAndSend("/topic/deal/" + dealId, saved);

        User otherParty = sender.getEmail().equals(deal.getOwner().getEmail())
                ? deal.getInvestor()
                : deal.getOwner();

        notificationService.createNotification(
                otherParty,
                NotificationType.MESSAGE_RECEIVED,
                "New Message",
                sender.getName() + " sent you a message in the deal room",
                dealId
        );

        return saved;
    }

    public List<Message> getMessages(Integer dealId) {
        getDeal(dealId);
        return messageRepository.findByDealIdOrderBySentAtAsc(dealId);
    }

    public Map<String, Object> initiatePayment(Integer dealId) {
        User currentUser = getCurrentUser();
        Deal deal = getDeal(dealId);

        if (!deal.getInvestor().getEmail().equals(currentUser.getEmail())) {
            throw new RuntimeException("Only the investor can initiate payment");
        }

        return paystackService.initializePayment(deal);
    }

    @Transactional
    public Deal verifyPayment(Integer dealId, String reference) {
        Deal deal = dealRepository.findByIdForUpdate(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (deal.getStatus() == DealStatus.ACTIVE) {
            return deal;
        }

        String ref = (reference != null && !reference.isBlank())
                ? reference
                : deal.getPaystackRef();

        if (ref == null || ref.isBlank()) {
            throw new RuntimeException("No payment reference found. Please initiate payment first.");
        }

        boolean paid = paystackService.verifyPayment(ref);

        if (!paid) {
            throw new RuntimeException("Payment not confirmed by Paystack yet. If you completed checkout, please try again in a moment.");
        }

        return activateDealAfterPayment(deal);
    }

    /**
     * Called by the Paystack webhook whenever a charge.success event is received.
     * This is independent of the frontend calling /verify-payment — Paystack
     * notifies the backend directly, so payment gets confirmed even if the
     * app never calls verify-payment (closed early, crashed, no network, etc.).
     */
    @Transactional
    public void handlePaystackWebhook(Map<String, Object> payload) {
        String event = (String) payload.get("event");
        if ("charge.success".equals(event)) {
            handleChargeSuccess(payload);
        } else if ("transfer.success".equals(event)) {
            handleTransferSuccess(payload);
        }
    }

    private void handleChargeSuccess(Map<String, Object> payload) {
        Object dataObj = payload.get("data");
        if (!(dataObj instanceof Map)) {
            return;
        }
        Map<String, Object> data = (Map<String, Object>) dataObj;
        String reference = (String) data.get("reference");

        if (reference == null || reference.isBlank()) {
            return;
        }

        Deal deal = dealRepository.findByPaystackRef(reference).orElse(null);
        if (deal == null) {
            return;
        }

        // Re-fetch with lock to avoid racing with a concurrent verify-payment call
        deal = dealRepository.findByIdForUpdate(deal.getId())
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (deal.getStatus() == DealStatus.ACTIVE) {
            return; // already processed, idempotent no-op
        }

        boolean paid = paystackService.verifyPayment(reference);
        if (!paid) {
            return;
        }

        activateDealAfterPayment(deal);
    }

    private void handleTransferSuccess(Map<String, Object> payload) {
        Object dataObj = payload.get("data");
        if (!(dataObj instanceof Map)) {
            return;
        }
        Map<String, Object> data = (Map<String, Object>) dataObj;
        String reference = (String) data.get("reference");

        if (reference == null || reference.isBlank()) {
            return;
        }
        
        String chargeReference = reference;
        if (reference.endsWith("-DISB")) {
            chargeReference = reference.substring(0, reference.length() - 5);
        }
        
        // The transfer reference was set in PaystackService.disburseFunds
        Deal deal = dealRepository.findByPaystackRef(chargeReference).orElse(null);
        if (deal == null) {
            return;
        }

        deal = dealRepository.findByIdForUpdate(deal.getId())
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (!deal.isDisbursed()) {
            deal.setDisbursed(true);
            deal.setDisbursedAt(LocalDateTime.now());
            dealRepository.save(deal);

            notificationService.createNotification(
                    deal.getOwner(),
                    NotificationType.PAYMENT_RECEIVED,
                    "Payment Received",
                    "GHS " + deal.getBid().getAmount() + " has been disbursed to your MoMo account for deal #" + deal.getId(),
                    deal.getId()
            );
        }
    }

    /**
     * Shared logic: marks a deal ACTIVE, credits the pitch, generates the
     * repayment schedule, and attempts disbursement (non-fatal on failure).
     * Called from both verifyPayment() and handlePaystackWebhook().
     */
    private Deal activateDealAfterPayment(Deal deal) {
        deal.setStatus(DealStatus.ACTIVE);
        deal.setDisbursed(false);
        deal.setDisbursedAt(null);

        Pitch pitch = deal.getPitch();
        double currentRaised = pitch.getAmountRaised() != null ? pitch.getAmountRaised() : 0.0;
        pitch.setAmountRaised(currentRaised + deal.getBid().getAmount());
        pitchRepository.save(pitch);

        repaymentService.generateRepaymentSchedule(deal);

        Deal saved = dealRepository.save(deal);

        try {
            // Call Paystack to initiate the transfer
            paystackService.disburseFunds(saved);

            // Wait for webhook to officially confirm disbursement
            notificationService.createNotification(
                    saved.getOwner(),
                    NotificationType.PAYMENT_RECEIVED,
                    "Payment Received — Disbursement Pending",
                    "Your payment for deal #" + saved.getId() + " was received. Disbursement will be processed shortly.",
                    saved.getId()
            );
        } catch (Exception e) {
            System.err.println("=== DISBURSEMENT FAILED for deal #" + saved.getId() + " ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();

            notificationService.createNotification(
                    saved.getOwner(),
                    NotificationType.PAYMENT_RECEIVED,
                    "Payment Received — Disbursement Pending",
                    "Your payment for deal #" + saved.getId() + " was received. Disbursement will be processed shortly.",
                    saved.getId()
            );
        }

        return saved;
    }
}