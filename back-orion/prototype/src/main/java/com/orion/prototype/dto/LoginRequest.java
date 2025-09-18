package com.orion.prototype.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @JsonProperty("identifier")
        @JsonAlias({ "email", "username" })
        @NotBlank(message = "L'identifiant est obligatoire") String identifier,

        @NotBlank(message = "Le mot de passe est obligatoire") String password) {
}
