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
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Investor places a bid
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

        return bidRepository.save(bid);
    }

    // Business owner views all bids on their pitch
    public List<Bid> getBidsForPitch(Integer pitchId) {
        return bidRepository.findByPitchId(pitchId);
    }

    // Investor views their own bids
    public List<Bid> getMyBids() {
        User investor = getCurrentUser();
        return bidRepository.findByInvestorEmail(investor.getEmail());
    }

    // Either party counters a bid
    public Bid counterBid(Integer bidId, BidRequest request) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        // ADD THESE LINES
        User currentUser = getCurrentUser();
        String currentEmail = currentUser.getEmail();
        String ownerEmail = bid.getPitch().getOwner().getEmail();
        String investorEmail = bid.getInvestor().getEmail();

        if (!currentEmail.equals(ownerEmail) && !currentEmail.equals(investorEmail)) {
            throw new RuntimeException("You are not part of this bid");
        }
        // END OF NEW LINES

        bid.setAmount(request.getAmount());
        bid.setReturnType(request.getReturnType());
        bid.setReturnValue(request.getReturnValue());
        bid.setTimelineMonths(request.getTimelineMonths());
        bid.setNote(request.getNote());
        bid.setStatus(BidStatus.COUNTERED);

        return bidRepository.save(bid);
    }
    // Business owner accepts a bid
    public Bid acceptBid(Integer bidId) {
        User owner = getCurrentUser();

        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        if (!bid.getPitch().getOwner().getEmail().equals(owner.getEmail())) {
            throw new RuntimeException("You are not the owner of this pitch");
        }

        bid.setStatus(BidStatus.ACCEPTED);

        // Mark pitch as funded so no more bids come in
        Pitch pitch = bid.getPitch();
        pitch.setStatus(PitchStatus.FUNDED);
        pitchRepository.save(pitch);

        return bidRepository.save(bid);
    }

    // Business owner rejects a bid
    public Bid rejectBid(Integer bidId) {
        User owner = getCurrentUser();

        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        if (!bid.getPitch().getOwner().getEmail().equals(owner.getEmail())) {
            throw new RuntimeException("You are not the owner of this pitch");
        }

        bid.setStatus(BidStatus.REJECTED);
        return bidRepository.save(bid);
    }
}