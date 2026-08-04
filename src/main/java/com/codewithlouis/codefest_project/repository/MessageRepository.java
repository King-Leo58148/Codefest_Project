package com.codewithlouis.codefest_project.repository;

import com.codewithlouis.codefest_project.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findByDealIdOrderBySentAtAsc(Integer dealId);
    List<Message> findByDealIdAndSenderIdNotAndReadAtIsNull(Integer dealId, Integer senderId);
}