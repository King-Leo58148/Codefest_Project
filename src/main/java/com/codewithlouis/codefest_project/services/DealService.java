package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.*;
import com.codewithlouis.codefest_project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Called automatically when bid is accepted
    public Deal createDeal(Integer bidId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        // Check if deal already exists
        if (dealRepository.findByBidId(bidId).isPresent()) {
            throw new RuntimeException("Deal already exists for this bid");
        }

        Deal deal = new Deal();
        deal.setBid(bid);
        deal.setPitch(bid.getPitch());
        deal.setOwner(bid.getPitch().getOwner());
        deal.setInvestor(bid.getInvestor());
        deal.setStatus(DealStatus.PENDING_SIGNATURES);

        return dealRepository.save(deal);
    }

    // Get deal by ID
    public Deal getDeal(Integer dealId) {
        User currentUser = getCurrentUser();
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (!deal.getOwner().getEmail().equals(currentUser.getEmail()) &&
                !deal.getInvestor().getEmail().equals(currentUser.getEmail())) {
            throw new RuntimeException("You are not part of this deal");
        }

        return deal;
    }

    // Get my deals
    public List<Deal> getMyDeals() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.OWNER) {
            return dealRepository.findByOwnerEmail(currentUser.getEmail());
        } else {
            return dealRepository.findByInvestorEmail(currentUser.getEmail());
        }
    }

    // Sign the deal
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

        // Both signed — send MFI email
        if (deal.isOwnerSigned() && deal.isInvestorSigned()) {
            deal.setStatus(DealStatus.PENDING_MFI);
            emailService.sendMfiNotification(deal);
        }

        return dealRepository.save(deal);
    }

    // Admin approves MFI
    public Deal approveMfi(Integer dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));
        deal.setMfiApproved(true);
        deal.setStatus(DealStatus.PAYMENT_PENDING);
        return dealRepository.save(deal);
    }

    // Send a message in the deal room
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

        return saved;
    }

    // Get all messages in a deal
    public List<Message> getMessages(Integer dealId) {
        getDeal(dealId); // security check
        return messageRepository.findByDealIdOrderBySentAtAsc(dealId);
    }

}