package com.codewithlouis.codefest_project.configs;

import com.codewithlouis.codefest_project.dto.LoginResponseDto;
import com.codewithlouis.codefest_project.dto.LoginUserDto;
import com.codewithlouis.codefest_project.model.RefreshToken;
import com.codewithlouis.codefest_project.model.Role;
import com.codewithlouis.codefest_project.model.User;
import com.codewithlouis.codefest_project.repository.UserRepository;
import com.codewithlouis.codefest_project.services.AuthenticationService;
import com.codewithlouis.codefest_project.services.JwtService;
import com.codewithlouis.codefest_project.services.RefreshTokenService;
import com.codewithlouis.codefest_project.services.VerificationCodeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicationConfigurationTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private VerificationCodeService codeService;

    @Test
    void loginFindsLegacyMixedCaseEmailRowsThroughAuthenticationProvider() {
        ApplicationConfiguration configuration = new ApplicationConfiguration(userRepository);
        BCryptPasswordEncoder passwordEncoder = configuration.passwordEncoder();
        AuthenticationManager authenticationManager = configuration.authenticationProvider()::authenticate;
        AuthenticationService authenticationService = new AuthenticationService(
                userRepository,
                passwordEncoder,
                jwtService,
                refreshTokenService,
                authenticationManager,
                codeService
        );

        User legacyUser = new User();
        legacyUser.setName("Ama");
        legacyUser.setEmail("Legacy.User@Example.com");
        legacyUser.setPassword(passwordEncoder.encode("Password1!"));
        legacyUser.setRole(Role.OWNER);
        legacyUser.setEmailVerified(true);

        when(userRepository.findByEmailIgnoreCase("legacy.user@example.com"))
                .thenReturn(Optional.of(legacyUser));

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token");
        when(refreshTokenService.createRefreshToken("Legacy.User@Example.com")).thenReturn(refreshToken);
        when(jwtService.generateToken(legacyUser)).thenReturn("access-token");
        when(jwtService.getExpirationTime()).thenReturn(3600L);

        LoginUserDto request = new LoginUserDto();
        request.setEmail(" legacy.user@example.com ");
        request.setPassword("Password1!");

        LoginResponseDto response = authenticationService.login(request);

        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals(3600L, response.getExpiresIn());
        verify(userRepository, times(2)).findByEmailIgnoreCase("legacy.user@example.com");
    }
}
