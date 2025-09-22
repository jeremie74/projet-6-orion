package com.orion.prototype.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.orion.prototype.entity.RefreshToken;
import com.orion.prototype.entity.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteAllByUser(User user);
}
