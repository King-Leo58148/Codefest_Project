package com.codewithlouis.codefest_project.repository;


import com.codewithlouis.codefest_project.model.Deal;
import com.codewithlouis.codefest_project.model.DealStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DealRepository extends JpaRepository<Deal, Integer> {
    List<Deal> findByOwnerEmail(String email);
    List<Deal> findByInvestorEmail(String email);
    Optional<Deal> findByBidId(Integer bidId);
    List<Deal> findByStatus(DealStatus status);
}