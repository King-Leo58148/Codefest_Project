package com.codewithlouis.codefest_project.services;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatPresenceService {

    // email -> set of active session IDs
    private final Map<String, Set<String>> userSessions = new ConcurrentHashMap<>();

    // sessionId -> email
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();

    // email -> active dealId
    private final Map<String, Integer> userActiveRooms = new ConcurrentHashMap<>();

    public void userConnected(String email, String sessionId) {
        if (email == null || sessionId == null) return;
        sessionUserMap.put(sessionId, email);
        userSessions.computeIfAbsent(email, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
    }

    public String userDisconnected(String sessionId) {
        if (sessionId == null) return null;
        String email = sessionUserMap.remove(sessionId);
        if (email != null) {
            Set<String> sessions = userSessions.get(email);
            if (sessions != null) {
                sessions.remove(sessionId);
                if (sessions.isEmpty()) {
                    userSessions.remove(email);
                    userActiveRooms.remove(email);
                    return email;
                }
            }
        }
        return null;
    }

    public boolean isUserOnline(String email) {
        if (email == null) return false;
        Set<String> sessions = userSessions.get(email);
        return sessions != null && !sessions.isEmpty();
    }

    public void setUserActiveRoom(String email, Integer dealId) {
        if (email == null) return;
        if (dealId == null) {
            userActiveRooms.remove(email);
        } else {
            userActiveRooms.put(email, dealId);
        }
    }

    public void clearUserActiveRoom(String email, Integer dealId) {
        if (email == null) return;
        if (dealId == null || dealId.equals(userActiveRooms.get(email))) {
            userActiveRooms.remove(email);
        }
    }

    public Integer getUserActiveRoom(String email) {
        if (email == null) return null;
        return userActiveRooms.get(email);
    }
}
