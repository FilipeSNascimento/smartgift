package com.smartgift.dto;

public record ExtractLinkRequest(
        String url,
        String ownerId,
        String ownerName,
        String customTitle,
        String notesFromOwner,
        String priority
) {
}
