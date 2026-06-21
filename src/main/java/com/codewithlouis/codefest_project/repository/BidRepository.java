package com.codewithlouis.codefest_project.repository;


import com.codewithlouis.codefest_project.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Integer> {
    List<Bid> findByPitchId(Integer pitchId);
    List<Bid> findByInvestorEmail(String email);
}