package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.dto.EmailCodeRequest;
import com.codewithlouis.codefest_project.dto.ForgotPasswordRequest;
import com.codewithlouis.codefest_project.dto.LoginResponseDto;
import com.codewithlouis.codefest_project.dto.LoginUserDto;
import com.codewithlouis.codefest_project.dto.RegisterUserDto;
import com.codewithlouis.codefest_project.dto.ResetPasswordRequest;
import com.codewithlouis.codefest_project.model.RefreshToken;
import com.codewithlouis.codefest_project.model.Role;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.model.VerificationPurpose;
import com.codewithlouis.codefest_project.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private VerificationCodeService codeService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private AuthenticationService service;

    @BeforeEach
    void setUp() {
        service = new AuthenticationService(
                userRepository,
                passwordEncoder,
                jwtService,
                refreshTokenService,
                authenticationManager,
                codeService
        );
    }

    @Test
    void signupCreatesUnverifiedUserAndIssuesSignupCode() {
        RegisterUserDto request = registerRequest("new@example.com");
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Password1!")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0, User.class));

        User created = service.signup(request);

        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("new@example.com", savedUser.getEmail());
        assertEquals("encoded-password", savedUser.getPassword());
        assertFalse(savedUser.isEmailVerified());
        verify(codeService).issue("new@example.com", VerificationPurpose.SIGNUP_EMAIL);
        assertSame(savedUser, created);
    }

    @Test
    void signupForExistingUnverifiedEmailResendsCodeWithoutDuplicatingAccount() {
        RegisterUserDto request = registerRequest("pending@example.com");
        User existingUser = user("pending@example.com");
        existingUser.setEmailVerified(false);
        when(userRepository.findByEmail("pending@example.com")).thenReturn(Optional.of(existingUser));

        User returned = service.signup(request);

        assertSame(existingUser, returned);
        verify(codeService).issue("pending@example.com", VerificationPurpose.SIGNUP_EMAIL);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void signupRejectsExistingVerifiedEmail() {
        RegisterUserDto request = registerRequest("taken@example.com");
        User existingUser = user("taken@example.com");
        existingUser.setEmailVerified(true);
        when(userRepository.findByEmail("taken@example.com")).thenReturn(Optional.of(existingUser));

        RuntimeException error = assertThrows(RuntimeException.class, () -> service.signup(request));

        assertEquals("Email already in use", error.getMessage());
        verify(codeService, never()).issue(any(String.class), any(VerificationPurpose.class));
    }

    @Test
    void loginRejectsUnverifiedEmail() {
        LoginUserDto loginDto = loginRequest("user@example.com");
        User user = user("user@example.com");
        user.setEmailVerified(false);
        when(authenticationManager.authenticate(any())).thenReturn(mockAuthentication());
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        IllegalStateException error = assertThrows(IllegalStateException.class, () -> service.login(loginDto));

        assertEquals("Email not verified", error.getMessage());
        verify(refreshTokenService, never()).createRefreshToken(any(String.class));
    }

    @Test
    void loginReturnsTokensForVerifiedUser() {
        LoginUserDto loginDto = loginRequest("user@example.com");
        User user = user("user@example.com");
        user.setEmailVerified(true);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token");
        when(authenticationManager.authenticate(any())).thenReturn(mockAuthentication());
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(refreshTokenService.createRefreshToken("user@example.com")).thenReturn(refreshToken);
        when(jwtService.generateToken(user)).thenReturn("access-token");
        when(jwtService.getExpirationTime()).thenReturn(3600L);

        LoginResponseDto response = service.login(loginDto);

        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals(3600L, response.getExpiresIn());
    }

    @Test
    void verifyEmailConsumesSignupCodeAndMarksUserVerified() {
        EmailCodeRequest request = new EmailCodeRequest();
        request.setEmail("user@example.com");
        request.setCode("123456");
        User user = user("user@example.com");
        user.setEmailVerified(false);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        service.verifyEmail(request);

        verify(codeService).consume("user@example.com", VerificationPurpose.SIGNUP_EMAIL, "123456");
        assertTrue(user.isEmailVerified());
        verify(userRepository).save(user);
    }

    @Test
    void forgotPasswordDoesNothingWhenAccountDoesNotExist() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("missing@example.com");
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> service.forgotPassword(request));

        verify(codeService, never()).issue(any(String.class), any(VerificationPurpose.class));
    }

    @Test
    void forgotPasswordIssuesResetCodeWhenAccountExists() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user("user@example.com")));

        service.forgotPassword(request);

        verify(codeService).issue("user@example.com", VerificationPurpose.PASSWORD_RESET);
    }

    @Test
    void resetPasswordRejectsMismatchedConfirmation() {
        ResetPasswordRequest request = resetPasswordRequest("user@example.com");
        request.setConfirmPassword("DifferentPassword1!");

        RuntimeException error = assertThrows(RuntimeException.class, () -> service.resetPassword(request));

        assertEquals("Passwords do not match", error.getMessage());
        verify(codeService, never()).consume(any(String.class), any(VerificationPurpose.class), any(String.class));
    }

    @Test
    void resetPasswordConsumesResetCodeAndRevokesRefreshTokens() {
        ResetPasswordRequest request = resetPasswordRequest("user@example.com");
        User user = user("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewPassword1!")).thenReturn("encoded-new-password");

        service.resetPassword(request);

        verify(codeService).consume("user@example.com", VerificationPurpose.PASSWORD_RESET, "123456");
        verify(passwordEncoder).encode("NewPassword1!");
        verify(refreshTokenService).deleteByUser(user);
        verify(userRepository).save(user);
        assertEquals("encoded-new-password", user.getPassword());
    }

    private RegisterUserDto registerRequest(String email) {
        RegisterUserDto request = new RegisterUserDto();
        request.setName("Ama");
        request.setEmail(email);
        request.setPassword("Password1!");
        request.setConfirmPassword("Password1!");
        request.setRole(Role.OWNER);
        return request;
    }

    private LoginUserDto loginRequest(String email) {
        LoginUserDto request = new LoginUserDto();
        request.setEmail(email);
        request.setPassword("Password1!");
        return request;
    }

    private ResetPasswordRequest resetPasswordRequest(String email) {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail(email);
        request.setCode("123456");
        request.setNewPassword("NewPassword1!");
        request.setConfirmPassword("NewPassword1!");
        return request;
    }

    private Authentication mockAuthentication() {
        return new Authentication() {
            @Override
            public String getName() {
                return "user@example.com";
            }

            @Override
            public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
                return java.util.List.of();
            }

            @Override
            public Object getCredentials() {
                return null;
            }

            @Override
            public Object getDetails() {
                return null;
            }

            @Override
            public Object getPrincipal() {
                return null;
            }

            @Override
            public boolean isAuthenticated() {
                return true;
            }

            @Override
            public void setAuthenticated(boolean isAuthenticated) {
            }
        };
    }

    private User user(String email) {
        User user = new User();
        user.setName("Ama");
        user.setEmail(email);
        user.setPassword("encoded-password");
        user.setRole(Role.OWNER);
        assertNotNull(user.getRole());
        return user;
    }
}
