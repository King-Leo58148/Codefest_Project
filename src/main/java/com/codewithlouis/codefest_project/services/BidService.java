package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.model.*;
import com.codewithlouis.codefest_project.repository.BidRepository;
import com.codewithlouis.codefest_project.repository.PitchRepository;
import com.codewithlouis.codefest_project.repository.UserRepository;
import com.codewithlouis.codefest_project.request.BidRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final PitchRepository pitchRepository;
    private final DealService dealService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Bid placeBid(Integer pitchId, BidRequest request) {
        User investor = getCurrentUser();

        if (!investor.isGhanaCardVerified() || !investor.isMomoVerified()) {
            throw new RuntimeException("You must complete verification before placing a bid");
        }

        Pitch pitch = pitchRepository.findById(pitchId)
                .orElseThrow(() -> new RuntimeException("Pitch not found"));

        if (pitch.getOwner().getEmail().equals(investor.getEmail())) {
            throw new RuntimeException("You cannot bid on your own pitch");
        }

        if (investor.getRole() != Role.INVESTOR && investor.getRole() != Role.BOTH) {
            throw new RuntimeException("Only investors can place a bid");
        }

        if (pitch.getStatus() != PitchStatus.LIVE) {
            throw new RuntimeException("This pitch is not accepting bids");
        }

        Bid bid = new Bid();
        bid.setPitch(pitch);
        bid.setInvestor(investor);
        bid.setAmount(request.getAmount());
        bid.setReturnType(request.getReturnType());
        bid.setReturnValue(request.getReturnValue());
        bid.setTimelineMonths(request.getTimelineMonths());
        bid.setNote(request.getNote());
        bid.setStatus(BidStatus.PENDING);

        // Save first so bid.getId() is not null
        Bid saved = bidRepository.save(bid);

        notificationService.createNotification(
                pitch.getOwner(),
                NotificationType.BID_RECEIVED,
                "New Bid Received",
                investor.getName() + " placed a bid of GHS " + request.getAmount() + " on your pitch",
                saved.getId()
        );

        return saved;
    }

    public List<Bid> getBidsForPitch(Integer pitchId) {
        return bidRepository.findByPitchId(pitchId);
    }

    public List<Bid> getMyBids() {
        User investor = getCurrentUser();
        return bidRepository.findByInvestorEmail(investor.getEmail());
    }

    public Bid counterBid(Integer bidId, BidRequest request) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        User currentUser = getCurrentUser();
        String currentEmail = currentUser.getEmail();
        String ownerEmail = bid.getPitch().getOwner().getEmail();
        String investorEmail = bid.getInvestor().getEmail();

        if (!currentEmail.equals(ownerEmail) && !currentEmail.equals(investorEmail)) {
            throw new RuntimeException("You are not part of this bid");
        }

        bid.setAmount(request.getAmount());
        bid.setReturnType(request.getReturnType());
        bid.setReturnValue(request.getReturnValue());
        bid.setTimelineMonths(request.getTimelineMonths());
        bid.setNote(request.getNote());
        bid.setStatus(BidStatus.COUNTERED);

        User otherParty = currentEmail.equals(bid.getInvestor().getEmail())
                ? bid.getPitch().getOwner()
                : bid.getInvestor();

        notificationService.createNotification(
                otherParty,
                NotificationType.BID_COUNTERED,
                "Counter Offer Received",
                currentUser.getName() + " sent a counter offer on " + bid.getPitch().getBusinessName(),
                bid.getId()
        );

        return bidRepository.save(bid);
    }

    public Bid acceptBid(Integer bidId) {
        User owner = getCurrentUser();
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        if (!bid.getPitch().getOwner().getEmail().equals(owner.getEmail())) {
            throw new RuntimeException("You are not the owner of this pitch");
        }

        bid.setStatus(BidStatus.ACCEPTED);

        Pitch pitch = bid.getPitch();
        pitch.setStatus(PitchStatus.FUNDED);
        pitchRepository.save(pitch);

        bidRepository.save(bid);

        dealService.createDeal(bidId);

        notificationService.createNotification(
                bid.getInvestor(),
                NotificationType.BID_ACCEPTED,
                "Bid Accepted",
                "Your bid on " + bid.getPitch().getBusinessName() + " has been accepted. Go to deal room.",
                bid.getId()
        );

        return bid;
    }

    public Bid rejectBid(Integer bidId) {
        User owner = getCurrentUser();

        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        if (!bid.getPitch().getOwner().getEmail().equals(owner.getEmail())) {
            throw new RuntimeException("You are not the owner of this pitch");
        }

        bid.setStatus(BidStatus.REJECTED);

        notificationService.createNotification(
                bid.getInvestor(),
                NotificationType.BID_REJECTED,
                "Bid Rejected",
                "Your bid on " + bid.getPitch().getBusinessName() + " was rejected.",
                bid.getId()
        );

        return bidRepository.save(bid);
    }
}