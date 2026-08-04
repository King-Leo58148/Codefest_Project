package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.services.ChatPresenceService;
import com.codewithlouis.codefest_project.services.DealService;
import lombok.Data;
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

    /**
     * The mobile client publishes here when its socket is live. Without this
     * mapping the frame was silently dropped by the broker.
     */
    @MessageMapping("/chat.sendMessage/{dealId}")
    public void sendMessage(@DestinationVariable Integer dealId,
                            ChatMessagePayload payload,
                            Principal principal) {
        if (principal == null || payload == null) return;
        String content = payload.getContent();
        if (content == null || content.isBlank()) return;

        // Fans out to /topic/deal/{dealId} inside the service.
        dealService.sendMessage(dealId, content, principal.getName());
    }

    @Data
    public static class ChatMessagePayload {
        private String content;
    }

    private void broadcastStatus(Integer dealId) {
        try {
            Map<String, Object> status = dealService.getChatStatus(dealId);
            messagingTemplate.convertAndSend("/topic/deal/" + dealId + "/status", status);
        } catch (Exception ignored) {}
    }
}
