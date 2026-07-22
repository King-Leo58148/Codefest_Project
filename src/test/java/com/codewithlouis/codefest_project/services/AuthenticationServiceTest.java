package com.codewithlouis.codefest_project.services;

import com.codewithlouis.codefest_project.dto.LoginResponseDto;
import com.codewithlouis.codefest_project.dto.LoginUserDto;
import com.codewithlouis.codefest_project.dto.RegisterUserDto;
import com.codewithlouis.codefest_project.model.RefreshToken;
import com.codewithlouis.codefest_project.model.Role;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.repository.UserRepository;
import jakarta.persistence.Column;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.hibernate.annotations.ColumnDefault;

import java.lang.reflect.Field;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
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

    @Captor
    private ArgumentCaptor<User> userCaptor;

    @Captor
    private ArgumentCaptor<UsernamePasswordAuthenticationToken> authenticationTokenCaptor;

    private AuthenticationService service;

    @BeforeEach
    void setUp() {
        service = new AuthenticationService(
                userRepository,
                passwordEncoder,
                jwtService,
                refreshTokenService,
                authenticationManager
        );
    }

    @Test
    void signupCreatesVerifiedUserWithoutIssuingEmailCode() {
        RegisterUserDto request = registerRequest("new@example.com");
        when(userRepository.findByEmailIgnoreCase("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Password1!")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0, User.class));

        User created = service.signup(request);

        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("new@example.com", savedUser.getEmail());
        assertEquals("encoded-password", savedUser.getPassword());
        assertTrue(savedUser.isEmailVerified());
        assertEquals(savedUser, created);
    }

    @Test
    void signupRejectsExistingEmail() {
        RegisterUserDto request = registerRequest("taken@example.com");
        User existingUser = user("taken@example.com");
        when(userRepository.findByEmailIgnoreCase("taken@example.com")).thenReturn(Optional.of(existingUser));

        RuntimeException error = assertThrows(RuntimeException.class, () -> service.signup(request));

        assertEquals("Email already in use", error.getMessage());
    }

    @Test
    void loginReturnsTokensForLegacyUnverifiedUser() {
        LoginUserDto loginDto = loginRequest("user@example.com");
        User user = user("user@example.com");
        user.setEmailVerified(false);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token");
        when(authenticationManager.authenticate(any())).thenReturn(mockAuthentication());
        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(refreshTokenService.createRefreshToken("user@example.com")).thenReturn(refreshToken);
        when(jwtService.generateToken(user)).thenReturn("access-token");
        when(jwtService.getExpirationTime()).thenReturn(3600L);

        LoginResponseDto response = service.login(loginDto);

        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals(3600L, response.getExpiresIn());
    }

    @Test
    void loginReturnsTokensForVerifiedUser() {
        LoginUserDto loginDto = loginRequest(" User@Example.com ");
        User user = user("user@example.com");
        user.setEmailVerified(true);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token");
        when(authenticationManager.authenticate(any())).thenReturn(mockAuthentication());
        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(refreshTokenService.createRefreshToken("user@example.com")).thenReturn(refreshToken);
        when(jwtService.generateToken(user)).thenReturn("access-token");
        when(jwtService.getExpirationTime()).thenReturn(3600L);

        LoginResponseDto response = service.login(loginDto);

        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals(3600L, response.getExpiresIn());
        verify(authenticationManager).authenticate(authenticationTokenCaptor.capture());
        assertEquals("user@example.com", authenticationTokenCaptor.getValue().getPrincipal());
    }

    @Test
    void emailVerifiedUsesDatabaseDefaultTrueForSchemaUpdates() throws NoSuchFieldException {
        Field emailVerifiedField = User.class.getDeclaredField("emailVerified");
        Column column = emailVerifiedField.getAnnotation(Column.class);
        ColumnDefault columnDefault = emailVerifiedField.getAnnotation(ColumnDefault.class);

        assertEquals("boolean default true", column.columnDefinition());
        assertEquals("true", columnDefault.value());
        assertTrue(new User().isEmailVerified());
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
