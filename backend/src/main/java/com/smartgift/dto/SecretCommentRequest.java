package com.smartgift.dto;

public record SecretCommentRequest(
        String authorId,
        String authorName,
        String authorAvatar,
        String text
) {
}
