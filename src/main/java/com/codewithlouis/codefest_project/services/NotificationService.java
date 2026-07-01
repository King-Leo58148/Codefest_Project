package com.codewithlouis.codefest_project.services;


import com.codewithlouis.codefest_project.model.*;
import com.codewithlouis.codefest_project.repository.NotificationRepository;
import com.codewithlouis.codefest_project.repository.UserRepository;
import com.codewithlouis.codefest_project.request.SendNotificationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Notification createNotification(User user, NotificationType type,
                                           String title, String message, Integer referenceId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceId(referenceId);

        Notification saved = notificationRepository.save(notification);

        // Push via WebSocket instantly
        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                saved
        );

        return saved;
    }

    public Object sendNotification(SendNotificationRequest request) {
        String target = request.getTarget() == null ? "all" : request.getTarget();
        String title = request.getTitle();
        if (title == null || title.isBlank()) {
            title = target.equalsIgnoreCase("all") ? "Platform Announcement" : "Direct Message";
        }
        final String resolvedTitle = title;

        if (target.equalsIgnoreCase("all")) {
            List<User> users = userRepository.findAll();
            return users.stream()
                    .map(user -> createNotification(
                            user,
                            NotificationType.MESSAGE_RECEIVED,
                            resolvedTitle,
                            request.getMessage(),
                            null
                    ))
                    .toList();
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required for sending a notification to a specific user.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User with email " + request.getEmail() + " not found"));

        return createNotification(
                user,
                NotificationType.MESSAGE_RECEIVED,
                title,
                request.getMessage(),
                null
        );
    }

    public List<Notification> getMyNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    public long getUnreadCount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return notificationRepository.countByUserEmailAndReadFalse(email);
    }

    public Notification markAsRead(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Notification> notifications = notificationRepository
                .findByUserEmailOrderByCreatedAtDesc(email);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
}