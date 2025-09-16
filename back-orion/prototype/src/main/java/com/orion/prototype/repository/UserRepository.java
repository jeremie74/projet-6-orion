package com.orion.prototype.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.orion.prototype.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);
}