package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.services.ChatPresenceService;
import com.codewithlouis.codefest_project.services.DealService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatPresenceController {

    private final ChatPresenceService chatPresenceService;
    private final DealService dealService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.enterRoom/{dealId}")
    public void enterRoom(@DestinationVariable Integer dealId, Principal principal) {
        if (principal == null) return;
        String userEmail = principal.getName();
        chatPresenceService.setUserActiveRoom(userEmail, dealId);
        dealService.markMessagesAsRead(dealId, userEmail);

        broadcastStatus(dealId);
    }

    @MessageMapping("/chat.leaveRoom/{dealId}")
    public void leaveRoom(@DestinationVariable Integer dealId, Principal principal) {
        if (principal == null) return;
        String userEmail = principal.getName();
        chatPresenceService.clearUserActiveRoom(userEmail, dealId);

        broadcastStatus(dealId);
    }

    private void broadcastStatus(Integer dealId) {
        try {
            Map<String, Object> status = dealService.getChatStatus(dealId);
            messagingTemplate.convertAndSend("/topic/deal/" + dealId + "/status", status);
        } catch (Exception ignored) {}
    }
}
