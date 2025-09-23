package com.orion.prototype.service;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.orion.prototype.dto.LoginRequest;
import com.orion.prototype.dto.LoginResponse;
import com.orion.prototype.dto.RegisterRequest;
import com.orion.prototype.dto.UserDto;
import com.orion.prototype.entity.User;
import com.orion.prototype.repository.UserRepository;
import com.orion.prototype.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public UserDto register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet utilisateur existe déjà");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .build();

        User saved = userRepository.save(user);
        return toDto(saved);
    }

    public LoginResponse login(LoginRequest request) {
        String identifier = request.identifier();

        Optional<User> userOptional = userRepository.findByEmail(identifier);

        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByUsername(identifier);
        }

        User user = userOptional.orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Identifiant incorrect"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Identifiant incorrect");
        }

        String accessToken = jwtService.generateToken(user.getEmail());
        var refreshToken = refreshTokenService.createForUser(user);

        return new LoginResponse(accessToken, refreshToken.getToken(), user.getUsername(), user.getId());
    }

    public LoginResponse refresh(String refreshTokenValue) {
        var refreshToken = refreshTokenService.validate(refreshTokenValue);
        var user = refreshToken.getUser();

        String accessToken = jwtService.generateToken(user.getEmail());
        var newRefreshToken = refreshTokenService.createForUser(user);

        return new LoginResponse(accessToken, newRefreshToken.getToken(), user.getUsername(), user.getId());
    }

    public void logout(org.springframework.security.core.Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));
        refreshTokenService.deleteForUser(user);
    }

    // Get current user info (as DTO)
    public UserDto getCurrentUser(Authentication authentication) {
        String email = (String) authentication.getPrincipal();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        return toDto(user);
    }

    // Conversion User → UserDto
    private UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail());
    }
}
