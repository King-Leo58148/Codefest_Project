package com.codewithlouis.codefest_project.repository;


import com.codewithlouis.codefest_project.model.Repayment;
import com.codewithlouis.codefest_project.model.RepaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RepaymentRepository extends JpaRepository<Repayment, Integer> {
    List<Repayment> findByDealId(Integer dealId);
    List<Repayment> findByDealIdIn(List<Integer> dealIds);
    List<Repayment> findByStatusAndDueDateLessThanEqual(RepaymentStatus status, LocalDate date);
    List<Repayment> findByStatus(RepaymentStatus status);
}