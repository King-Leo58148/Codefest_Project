package com.codewithlouis.codefest_project.repository;

import com.codewithlouis.codefest_project.model.RefreshToken;
import com.codewithlouis.codefest_project.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUser(User user);
}