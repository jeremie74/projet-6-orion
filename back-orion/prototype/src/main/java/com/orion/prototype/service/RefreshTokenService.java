package com.orion.prototype.service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.orion.prototype.entity.RefreshToken;
import com.orion.prototype.entity.User;
import com.orion.prototype.repository.RefreshTokenRepository;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final Duration refreshTokenDuration;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${app.security.refresh-token.expiration-hours:168}") long refreshTokenExpirationHours) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenDuration = Duration.ofHours(refreshTokenExpirationHours);
    }

    @Transactional
    public RefreshToken createForUser(User user) {
        refreshTokenRepository.deleteAllByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plus(refreshTokenDuration))
                .user(user)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken validate(String tokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Refresh token invalide"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Refresh token expiré");
        }

        // Initialize user before leaving transactional context
        refreshToken.getUser().getId();

        return refreshToken;
    }

    public void deleteForUser(User user) {
        refreshTokenRepository.deleteAllByUser(user);
    }
}
