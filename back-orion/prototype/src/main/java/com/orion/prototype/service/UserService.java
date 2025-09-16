package com.orion.prototype.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.orion.prototype.dto.UserDto;
import com.orion.prototype.entity.User;
import com.orion.prototype.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all users (as DTOs)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // Get a user by id (as DTO)
    public Optional<UserDto> getUserById(Long id) {
        return userRepository.findById(id).map(this::toDto);
    }

    // Update a user (e.g., profile) and return DTO
    public UserDto updateUser(User user) {
        User saved = userRepository.save(user);
        return toDto(saved);
    }

    // Delete a user
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // Convert User entity to UserDto
    private UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail());
    }
}