package com.smartgift.dto;

public record ContributionRequest(
        String userId,
        String userName,
        String userAvatar,
        double amount
) {
}
