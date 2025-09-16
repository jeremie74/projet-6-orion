package com.orion.prototype.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PostDto(
        Long id,
        String title,
        String content,
        LocalDateTime createdAt,
        String topicName,
        String authorUsername,
        List<CommentDto> comments) {
}