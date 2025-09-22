package com.orion.prototype.dto;

public record LoginResponse(String accessToken, String refreshToken, String username, Long userId) {
}
