package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.*;
import com.codewithlouis.codefest_project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
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

        // Notify both parties
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
            // BOTH role
            List<Deal> deals = dealRepository.findByOwnerEmail(currentUser.getEmail());
            deals.addAll(dealRepository.findByInvestorEmail(currentUser.getEmail()));
            return deals;
        }
    }

    @CacheEvict(value = {"allDeals", "dealsByStatus"}, allEntries = true)
    public Deal signDeal(Integer dealId) {
        User currentUser = getCurrentUser();
        Deal deal = getDeal(dealId);

        if (deal.getStatus() != DealStatus.PENDING_SIGNATURES) {
            throw new RuntimeException("This deal is not pending signatures");
        }

        if (currentUser.getEmail().equals(deal.getOwner().getEmail())) {
            deal.setOwnerSigned(true);
        } else if (currentUser.getEmail().equals(deal.getInvestor().getEmail())) {
            deal.setInvestorSigned(true);
        }

        // Notify other party
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

        // Both signed — send MFI email
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

        // Notify investor to pay
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

        // Notify both parties
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

        // Broadcast to WebSocket subscribers
        messagingTemplate.convertAndSend("/topic/deal/" + dealId, saved);

        // Notify other party
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

    @CacheEvict(value = {"allDeals", "dealsByStatus"}, allEntries = true)
    public Deal verifyPayment(Integer dealId, String reference) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        boolean paid = paystackService.verifyPayment(reference);

        if (paid) {
            deal.setStatus(DealStatus.ACTIVE);
            deal.setDisbursed(true);
            deal.setDisbursedAt(LocalDateTime.now());
            repaymentService.generateRepaymentSchedule(deal);
            paystackService.disburseFunds(deal);

            // Notify owner
            notificationService.createNotification(
                    deal.getOwner(),
                    NotificationType.PAYMENT_RECEIVED,
                    "Payment Received",
                    "GHS " + deal.getBid().getAmount() + " has been disbursed to your MoMo account for deal #" + deal.getId(),
                    deal.getId()
            );

            return dealRepository.save(deal);
        } else {
            throw new RuntimeException("Payment verification failed");
        }
    }
}