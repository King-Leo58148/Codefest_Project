package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.dto.ProfileUpdateRequest;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.services.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PatchMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(profileService.updateProfile(authentication.getName(), request));
    }
}
