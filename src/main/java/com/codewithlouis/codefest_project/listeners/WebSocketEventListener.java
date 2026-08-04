package com.codewithlouis.codefest_project.listeners;

import com.codewithlouis.codefest_project.model.Deal;
import com.codewithlouis.codefest_project.repository.DealRepository;
import com.codewithlouis.codefest_project.services.ChatPresenceService;
import com.codewithlouis.codefest_project.services.DealService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final ChatPresenceService chatPresenceService;
    private final DealRepository dealRepository;
    private final DealService dealService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        if (principal == null) return;

        String email = principal.getName();
        String sessionId = headerAccessor.getSessionId();
        chatPresenceService.userConnected(email, sessionId);
        broadcastPresenceForUser(email);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        // Returns the email only once the user's LAST session has closed.
        String email = chatPresenceService.userDisconnected(sessionId);
        if (email != null) {
            broadcastPresenceForUser(email);
        }
    }

    /**
     * Push a fresh chat status onto every deal room this user belongs to, so the
     * other party sees the online/offline change immediately instead of only
     * after a page refresh.
     */
    private void broadcastPresenceForUser(String email) {
        try {
            List<Deal> deals = new ArrayList<>(dealRepository.findByOwnerEmail(email));
            deals.addAll(dealRepository.findByInvestorEmail(email));

            for (Deal deal : deals) {
                try {
                    messagingTemplate.convertAndSend(
                            "/topic/deal/" + deal.getId() + "/status",
                            dealService.getChatStatus(deal.getId())
                    );
                } catch (Exception ignored) {
                }
            }
        } catch (Exception ignored) {
        }
    }
}
