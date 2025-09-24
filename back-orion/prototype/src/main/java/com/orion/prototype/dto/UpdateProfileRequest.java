package com.orion.prototype.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        String username,
        @Email(message = "Email invalide") String email,
        @NotBlank(message = "Le mot de passe actuel est obligatoire") String password,
        @Size(min = 6, message = "Le nouveau mot de passe doit contenir au moins 6 caractères") String newPassword) {
}

