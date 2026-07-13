package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.dto.ProfileUpdateRequest;
import com.codewithlouis.codefest_project.model.Role;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private ProfileService service;

    @BeforeEach
    void setUp() {
        service = new ProfileService(userRepository, passwordEncoder);
    }

    @Test
    void updateProfileClearsMomoVerificationWhenNumberChanges() {
        User user = user("owner@example.com");
        user.setMomoNumber("0550001111");
        user.setMomoVerified(true);
        when(userRepository.findByEmailIgnoreCase("owner@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0, User.class));

        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setName("Updated Owner");
        request.setMomoNumber("024-123-4567");

        User updated = service.updateProfile("owner@example.com", request);

        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertSame(user, updated);
        assertEquals("Updated Owner", savedUser.getName());
        assertEquals("0241234567", savedUser.getMomoNumber());
        assertTrue(!savedUser.isMomoVerified());
    }

    @Test
    void updateProfilePreservesMomoVerificationWhenNormalizedNumberIsUnchanged() {
        User user = user("owner@example.com");
        user.setMomoNumber("0550001111");
        user.setMomoVerified(true);
        when(userRepository.findByEmailIgnoreCase("owner@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0, User.class));

        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setMomoNumber("(055) 000-1111");

        User updated = service.updateProfile("owner@example.com", request);

        assertSame(user, updated);
        assertEquals("0550001111", updated.getMomoNumber());
        assertTrue(updated.isMomoVerified());
    }

    @Test
    void updateProfileRejectsInvalidMomoNumber() {
        User user = user("owner@example.com");
        when(userRepository.findByEmailIgnoreCase("owner@example.com")).thenReturn(Optional.of(user));

        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setMomoNumber("12345");

        IllegalArgumentException error =
                assertThrows(IllegalArgumentException.class, () -> service.updateProfile("owner@example.com", request));

        assertEquals("MoMo number must be exactly 10 digits", error.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateProfileIgnoresBlankOptionalFields() {
        User user = user("owner@example.com");
        user.setMomoNumber("0550001111");
        user.setMomoVerified(true);
        when(userRepository.findByEmailIgnoreCase("owner@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0, User.class));

        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setName("   ");
        request.setCurrentPassword(" ");
        request.setNewPassword(" ");
        request.setConfirmPassword(" ");
        request.setMomoNumber(" ");

        User updated = service.updateProfile("owner@example.com", request);

        assertSame(user, updated);
        assertEquals("Owner", updated.getName());
        assertEquals("0550001111", updated.getMomoNumber());
        assertTrue(updated.isMomoVerified());
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void updateProfileRejectsPasswordChangeWhenCurrentPasswordIsWrong() {
        User user = user("owner@example.com");
        when(userRepository.findByEmailIgnoreCase("owner@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword1!", "encoded-current-password")).thenReturn(false);

        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setCurrentPassword("WrongPassword1!");
        request.setNewPassword("NewPassword1!");
        request.setConfirmPassword("NewPassword1!");

        IllegalArgumentException error =
                assertThrows(IllegalArgumentException.class, () -> service.updateProfile("owner@example.com", request));

        assertEquals("Current password is incorrect", error.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateProfileEncodesPasswordWhenChangeIsValid() {
        User user = user("owner@example.com");
        when(userRepository.findByEmailIgnoreCase("owner@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("CurrentPassword1!", "encoded-current-password")).thenReturn(true);
        when(passwordEncoder.encode("NewPassword1!")).thenReturn("encoded-new-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0, User.class));

        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setCurrentPassword("CurrentPassword1!");
        request.setNewPassword("NewPassword1!");
        request.setConfirmPassword("NewPassword1!");

        User updated = service.updateProfile("owner@example.com", request);

        assertSame(user, updated);
        assertEquals("encoded-new-password", updated.getPassword());
        verify(passwordEncoder).encode("NewPassword1!");
    }

    private User user(String email) {
        User user = new User();
        user.setName("Owner");
        user.setEmail(email);
        user.setPassword("encoded-current-password");
        user.setRole(Role.OWNER);
        return user;
    }
}
