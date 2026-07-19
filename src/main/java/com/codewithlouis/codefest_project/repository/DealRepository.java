package com.codewithlouis.codefest_project.repository;

import com.codewithlouis.codefest_project.model.Deal;
import com.codewithlouis.codefest_project.model.DealStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DealRepository extends JpaRepository<Deal, Integer> {
    List<Deal> findByOwnerEmail(String email);
    List<Deal> findByInvestorEmail(String email);
    Optional<Deal> findByBidId(Integer bidId);
    List<Deal> findByStatus(DealStatus status);
    Optional<Deal> findByPaystackRef(String paystackRef);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM Deal d WHERE d.id = :id")
    Optional<Deal> findByIdForUpdate(@Param("id") Integer id);
}