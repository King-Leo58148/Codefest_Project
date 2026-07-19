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

    @CacheEvict(value = {"allDeals", "dealsByStatus"}, allEntries = true)
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
    @CacheEvict(value = {"allDeals", "dealsByStatus"}, allEntries = true)
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

    @CacheEvict(value = {"allDeals", "dealsByStatus"}, allEntries = true)
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

    @CacheEvict(value = {"allDeals", "dealsByStatus"}, allEntries = true)
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
    @CacheEvict(value = {"allDeals", "dealsByStatus"}, allEntries = true)
    public Deal verifyPayment(Integer dealId, String reference) {
        Deal deal = dealRepository.findByIdForUpdate(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        // Idempotency guard — already ACTIVE, nothing to do
        if (deal.getStatus() == DealStatus.ACTIVE) {
            return deal;
        }

        // Use the reference passed by the frontend; fall back to the one stored
        // on the deal at initiation time if the frontend sends null.
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

        // ── Payment confirmed ──────────────────────────────────────────────
        // Mark the deal ACTIVE and credit the pitch BEFORE attempting
        // disbursement. This way a failed disbursement (null MoMo, test-mode
        // transfer rejection, etc.) never rolls back a real payment.
        deal.setStatus(DealStatus.ACTIVE);
        deal.setDisbursed(false); // will be set true only if disbursement succeeds
        deal.setDisbursedAt(null);

        Pitch pitch = deal.getPitch();
        double currentRaised = pitch.getAmountRaised() != null ? pitch.getAmountRaised() : 0.0;
        pitch.setAmountRaised(currentRaised + deal.getBid().getAmount());
        pitchRepository.save(pitch);

        repaymentService.generateRepaymentSchedule(deal);

        // Save ACTIVE status now — flush so this commit is durable even if
        // disbursement below throws.
        Deal saved = dealRepository.save(deal);

        // ── Disbursement (best-effort, non-fatal) ──────────────────────────
        // Wrapped in try-catch so a Paystack transfer failure (invalid MoMo,
        // test-mode restriction, etc.) does NOT roll back the confirmed payment.
        try {
            paystackService.disburseFunds(saved);
            saved.setDisbursed(true);
            saved.setDisbursedAt(LocalDateTime.now());
            saved = dealRepository.save(saved);

            notificationService.createNotification(
                    saved.getOwner(),
                    NotificationType.PAYMENT_RECEIVED,
                    "Payment Received",
                    "GHS " + saved.getBid().getAmount() + " has been disbursed to your MoMo account for deal #" + saved.getId(),
                    saved.getId()
            );
        } catch (Exception e) {
            // Disbursement failed — payment is still confirmed and deal is ACTIVE.
            // Admin can retry disbursement manually via the dashboard.
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