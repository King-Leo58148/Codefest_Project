package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.dto.RegisterUserDto;
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

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
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
    void signupReturnsVerifiedPayload() throws Exception {
        RegisterUserDto request = new RegisterUserDto();
        request.setName("Ama");
        request.setEmail("user@example.com");
        request.setPassword("Password1!");
        request.setConfirmPassword("Password1!");
        request.setRole(Role.OWNER);

        User user = new User();
        user.setEmail("user@example.com");
        user.setEmailVerified(true);
        when(authenticationService.signup(any(RegisterUserDto.class))).thenReturn(user);

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.emailVerified").value(true))
                .andExpect(jsonPath("$.verificationRequired").value(false));
    }

    @Test
    void verifyEmailReturnsGone() throws Exception {
        mockMvc.perform(post("/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "user@example.com",
                                "code", "123456"
                        ))))
                .andExpect(status().isGone())
                .andExpect(jsonPath("$.message")
                        .value("Email verification and password reset by email are disabled"));
    }

    @Test
    void resendVerificationCodeReturnsGone() throws Exception {
        mockMvc.perform(post("/auth/resend-verification-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "user@example.com"))))
                .andExpect(status().isGone())
                .andExpect(jsonPath("$.message")
                        .value("Email verification and password reset by email are disabled"));
    }

    @Test
    void forgotPasswordReturnsGone() throws Exception {
        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "user@example.com"))))
                .andExpect(status().isGone())
                .andExpect(jsonPath("$.message")
                        .value("Email verification and password reset by email are disabled"));
    }

    @Test
    void resetPasswordReturnsGone() throws Exception {
        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "user@example.com",
                                "code", "123456",
                                "newPassword", "NewPassword1!",
                                "confirmPassword", "NewPassword1!"
                        ))))
                .andExpect(status().isGone())
                .andExpect(jsonPath("$.message")
                        .value("Email verification and password reset by email are disabled"));
    }

    @Test
    void verifyEmailReturnsGoneForInvalidLegacyCodeFormat() throws Exception {
        mockMvc.perform(post("/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", "user@example.com",
                        "code", "12345"
                ))))
                .andExpect(status().isGone());
    }

}
