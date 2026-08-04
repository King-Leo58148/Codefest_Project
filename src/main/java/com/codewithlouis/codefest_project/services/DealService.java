package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.*;
import com.codewithlouis.codefest_project.repository.*;
import lombok.RequiredArgsConstructor;
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
    private final ChatPresenceService chatPresenceService;

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
        return sendMessage(dealId, content, getCurrentUser());
    }

    // Used by the STOMP endpoint, where SecurityContextHolder is not populated
    // on the message-handling thread — the sender comes from the STOMP Principal.
    public Message sendMessage(Integer dealId, String content, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return sendMessage(dealId, content, sender);
    }

    private Message sendMessage(Integer dealId, String content, User sender) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        boolean isParty = sender.getEmail().equals(deal.getOwner().getEmail())
                || sender.getEmail().equals(deal.getInvestor().getEmail());
        if (!isParty) {
            throw new RuntimeException("You are not a party to this deal");
        }

        User otherParty = sender.getEmail().equals(deal.getOwner().getEmail())
                ? deal.getInvestor()
                : deal.getOwner();

        Message message = new Message();
        message.setDeal(deal);
        message.setSender(sender);
        message.setContent(content);

        if (chatPresenceService.isUserOnline(otherParty.getEmail()) &&
                dealId.equals(chatPresenceService.getUserActiveRoom(otherParty.getEmail()))) {
            message.setReadAt(LocalDateTime.now());
        }

        Message saved = messageRepository.save(message);

        messagingTemplate.convertAndSend("/topic/deal/" + dealId, saved);

        notificationService.createNotification(
                otherParty,
                NotificationType.MESSAGE_RECEIVED,
                "New Message",
                sender.getName() + " sent you a message in the deal room",
                dealId
        );

        return saved;
    }

    @Transactional
    public List<Message> markMessagesAsRead(Integer dealId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return List.of();
        List<Message> unread = messageRepository.findByDealIdAndSenderIdNotAndReadAtIsNull(dealId, user.getId());
        if (!unread.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            for (Message m : unread) {
                m.setReadAt(now);
            }
            List<Message> saved = messageRepository.saveAll(unread);
            messagingTemplate.convertAndSend("/topic/deal/" + dealId + "/read", Map.of(
                    "dealId", dealId,
                    "readBy", user.getEmail(),
                    "readAt", now.toString()
            ));
            return saved;
        }
        return List.of();
    }

    public Map<String, Object> getChatStatus(Integer dealId) {
        Deal deal = dealRepository.findById(dealId).orElse(null);
        if (deal == null) return Map.of();

        String ownerEmail = deal.getOwner().getEmail();
        String investorEmail = deal.getInvestor().getEmail();

        boolean ownerOnline = chatPresenceService.isUserOnline(ownerEmail);
        boolean investorOnline = chatPresenceService.isUserOnline(investorEmail);

        Integer ownerRoom = chatPresenceService.getUserActiveRoom(ownerEmail);
        Integer investorRoom = chatPresenceService.getUserActiveRoom(investorEmail);

        return Map.of(
                "dealId", dealId,
                "ownerEmail", ownerEmail,
                "ownerOnline", ownerOnline,
                "ownerActiveInRoom", ownerOnline && dealId.equals(ownerRoom),
                "investorEmail", investorEmail,
                "investorOnline", investorOnline,
                "investorActiveInRoom", investorOnline && dealId.equals(investorRoom)
        );
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
     * This is independent of the frontend calling /verify-payment; Paystack
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

        if (reference.startsWith("NKOSO-REPAY-")) {
            repaymentService.handlePaystackCharge(reference);
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
                    "GHS " + getNetDisbursementAmount(deal) + " has been disbursed to your MoMo account for deal #" + deal.getId(),
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
        double dealAmount = deal.getBid().getAmount();
        double platformFee = paystackService.calculatePlatformFee(dealAmount);
        deal.setPlatformFee(platformFee);
        deal.setNetDisbursementAmount(dealAmount);

        Pitch pitch = deal.getPitch();
        double currentRaised = pitch.getAmountRaised() != null ? pitch.getAmountRaised() : 0.0;
        pitch.setAmountRaised(currentRaised + deal.getBid().getAmount());
        pitchRepository.save(pitch);

        repaymentService.generateRepaymentSchedule(deal);

        Deal saved = dealRepository.save(deal);

        try {
            // Call Paystack to initiate the transfer
            paystackService.disburseFunds(saved);
            saved.setDisbursed(true);
            saved.setDisbursedAt(LocalDateTime.now());
            saved = dealRepository.save(saved);

            notificationService.createNotification(
                    saved.getOwner(),
                    NotificationType.PAYMENT_RECEIVED,
                    "Payment Received",
                    "GHS " + String.format("%.2f", getNetDisbursementAmount(saved)) + " has been disbursed to your MoMo account for deal #" + saved.getId() + ". Platform fee of GHS " + String.format("%.2f", getPlatformFee(saved)) + " was retained by Nkoso.",
                    saved.getId()
            );
        } catch (Exception e) {
            System.err.println("=== DISBURSEMENT FAILED for deal #" + saved.getId() + " ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();

            notificationService.createNotification(
                    saved.getOwner(),
                    NotificationType.PAYMENT_RECEIVED,
                    "Disbursement Pending",
                    "Payment was confirmed for deal #" + saved.getId() + ", but Paystack transfer did not complete yet. Nkoso will retry or review this disbursement.",
                    saved.getId()
            );
        }

        return saved;
    }

    private double getPlatformFee(Deal deal) {
        return deal.getPlatformFee() != null
                ? deal.getPlatformFee()
                : paystackService.calculatePlatformFee(deal.getBid().getAmount());
    }

    private double getNetDisbursementAmount(Deal deal) {
        return deal.getNetDisbursementAmount() != null
                ? deal.getNetDisbursementAmount()
                : deal.getBid().getAmount();
    }
}
