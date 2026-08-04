package com.codewithlouis.codefest_project.listeners;

import com.codewithlouis.codefest_project.services.ChatPresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final ChatPresenceService chatPresenceService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        if (principal != null) {
            String email = principal.getName();
            String sessionId = headerAccessor.getSessionId();
            chatPresenceService.userConnected(email, sessionId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        chatPresenceService.userDisconnected(sessionId);
    }
}
