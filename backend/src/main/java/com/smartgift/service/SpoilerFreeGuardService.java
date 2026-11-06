package com.smartgift.service;

import com.smartgift.model.WishItemEntity;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class SpoilerFreeGuardService {

    /**
     * Proteção "Sem Spoiler" no Backend:
     * Se quem está consultando o presente é o próprio dono da lista (viewerId == item.ownerId)
     * e não está no modo demonstrativo ('clan_friend'), todos os dados de reserva, vaquinha e
     * comentários secretos são removidos do objeto antes de retornar o JSON.
     */
    public WishItemEntity sanitizeForViewer(WishItemEntity source, String viewerId, String perspective) {
        boolean isOwner = viewerId != null && viewerId.equals(source.getOwnerId());
        boolean hideSpoilers = isOwner && !"clan_friend".equalsIgnoreCase(perspective);

        if (!hideSpoilers) {
            return source;
        }

        WishItemEntity cleanCopy = new WishItemEntity();
        cleanCopy.setId(source.getId());
        cleanCopy.setOwnerId(source.getOwnerId());
        cleanCopy.setOwnerName(source.getOwnerName());
        cleanCopy.setTitle(source.getTitle());
        cleanCopy.setCategory(source.getCategory());
        cleanCopy.setImageUrl(source.getImageUrl());
        cleanCopy.setOriginalUrl(source.getOriginalUrl());
        cleanCopy.setPriority(source.getPriority());
        cleanCopy.setNotesFromOwner(source.getNotesFromOwner());
        cleanCopy.setLowestPrice(source.getLowestPrice());
        cleanCopy.setHighestPrice(source.getHighestPrice());
        cleanCopy.setSavingsAmount(source.getSavingsAmount());
        cleanCopy.setSavingsPercent(source.getSavingsPercent());
        cleanCopy.setPriceHistoryLabel(source.getPriceHistoryLabel());
        cleanCopy.setOffers(source.getOffers());

        // Mascara qualquer spoiler de reserva, vaquinha ou chat secreto
        cleanCopy.setSecretStatus("disponivel");
        cleanCopy.setReservedByUserId(null);
        cleanCopy.setReservedByName(null);
        cleanCopy.setPoolTargetAmount(source.getLowestPrice());
        cleanCopy.setPoolCollectedAmount(0.0);
        cleanCopy.setContributions(Collections.emptyList());
        cleanCopy.setSecretComments(Collections.emptyList());

        return cleanCopy;
    }
}
