package com.codewithlouis.codefest_project.repository;



import com.codewithlouis.codefest_project.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String email);
    long countByUserEmailAndReadFalse(String email);
}