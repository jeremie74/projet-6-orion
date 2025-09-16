package com.orion.prototype.dto;

import java.time.LocalDateTime;

public record CommentDto(
        Long id,
        String content,
        LocalDateTime createdAt,
        String authorUsername) {
}