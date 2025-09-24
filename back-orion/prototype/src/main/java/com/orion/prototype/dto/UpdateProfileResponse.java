package com.orion.prototype.dto;

public record UpdateProfileResponse(
        UserDto user,
        String accessToken,
        String refreshToken) {
}

