package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.dto.EmailCodeRequest;
import com.codewithlouis.codefest_project.dto.ForgotPasswordRequest;
import com.codewithlouis.codefest_project.dto.RegisterUserDto;
import com.codewithlouis.codefest_project.dto.ResetPasswordRequest;
import com.codewithlouis.codefest_project.exceptions.GlobalExceptionHandler;
import com.codewithlouis.codefest_project.model.Role;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.repository.UserRepository;
import com.codewithlouis.codefest_project.services.AuthenticationService;
import com.codewithlouis.codefest_project.services.JwtService;
import com.codewithlouis.codefest_project.services.RefreshTokenService;
import com.codewithlouis.codefest_project.services.TokenBlacklistService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthenticationControllerTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    @Mock
    private UserRepository userRepository;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        AuthenticationController controller = new AuthenticationController(
                jwtService,
                authenticationService,
                refreshTokenService,
                tokenBlacklistService,
                userRepository
        );

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void signupReturnsVerificationRequiredPayload() throws Exception {
        RegisterUserDto request = new RegisterUserDto();
        request.setName("Ama");
        request.setEmail("user@example.com");
        request.setPassword("Password1!");
        request.setConfirmPassword("Password1!");
        request.setRole(Role.OWNER);

        User user = new User();
        user.setEmail("user@example.com");
        user.setEmailVerified(false);
        when(authenticationService.signup(any(RegisterUserDto.class))).thenReturn(user);

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.verificationRequired").value(true));
    }

    @Test
    void verifyEmailReturnsSuccessMessage() throws Exception {
        EmailCodeRequest request = new EmailCodeRequest();
        request.setEmail("user@example.com");
        request.setCode("123456");

        mockMvc.perform(post("/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Email verified successfully"));

        verify(authenticationService).verifyEmail(any(EmailCodeRequest.class));
    }

    @Test
    void resendVerificationCodeReturnsSuccessMessage() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("user@example.com");

        mockMvc.perform(post("/auth/resend-verification-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Verification code sent successfully"));

        verify(authenticationService).resendVerificationCode(any(ForgotPasswordRequest.class));
    }

    @Test
    void forgotPasswordReturnsNeutralMessage() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("user@example.com");

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("If an account exists for that email, a password reset code has been sent"));

        verify(authenticationService).forgotPassword(any(ForgotPasswordRequest.class));
    }

    @Test
    void resetPasswordReturnsConfirmationMessage() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("user@example.com");
        request.setCode("123456");
        request.setNewPassword("NewPassword1!");
        request.setConfirmPassword("NewPassword1!");

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset successfully"));

        verify(authenticationService).resetPassword(any(ResetPasswordRequest.class));
    }

    @Test
    void verifyEmailRejectsInvalidCodeFormat() throws Exception {
        EmailCodeRequest request = new EmailCodeRequest();
        request.setEmail("user@example.com");
        request.setCode("12345");

        mockMvc.perform(post("/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
