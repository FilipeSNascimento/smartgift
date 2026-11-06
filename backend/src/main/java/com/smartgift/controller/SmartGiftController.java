package com.smartgift.controller;

import com.smartgift.dto.ContributionRequest;
import com.smartgift.dto.ExtractLinkRequest;
import com.smartgift.dto.SecretCommentRequest;
import com.smartgift.model.ClanEntity;
import com.smartgift.model.SecretCommentEmbeddable;
import com.smartgift.model.SecretContributionEmbeddable;
import com.smartgift.model.WishItemEntity;
import com.smartgift.repository.ClanRepository;
import com.smartgift.repository.WishItemRepository;
import com.smartgift.service.LinkPriceExtractorService;
import com.smartgift.service.SpoilerFreeGuardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class SmartGiftController {

    private final WishItemRepository wishItemRepository;
    private final ClanRepository clanRepository;
    private final LinkPriceExtractorService extractorService;
    private final SpoilerFreeGuardService spoilerFreeGuard;

    public SmartGiftController(WishItemRepository wishItemRepository,
                               ClanRepository clanRepository,
                               LinkPriceExtractorService extractorService,
                               SpoilerFreeGuardService spoilerFreeGuard) {
        this.wishItemRepository = wishItemRepository;
        this.clanRepository = clanRepository;
        this.extractorService = extractorService;
        this.spoilerFreeGuard = spoilerFreeGuard;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "SmartGift API (Java 21 + Spring Boot 3)",
                "features", List.of("OpenGraph Link Extractor", "Hybrid Price Comparator", "SpoilerFreeGuard", "Clans & Secret Pool")
        );
    }

    @GetMapping("/wishes")
    public List<WishItemEntity> listWishes(
            @RequestParam(defaultValue = "u-filipe") String viewerId,
            @RequestParam(defaultValue = "owner") String perspective) {
        return wishItemRepository.findAll()
                .stream()
                .map(item -> spoilerFreeGuard.sanitizeForViewer(item, viewerId, perspective))
                .toList();
    }

    @PostMapping("/wishes/extract")
    public WishItemEntity extractAndCreateWish(@RequestBody ExtractLinkRequest request) {
        WishItemEntity entity = extractorService.extractAndCompare(request);
        return wishItemRepository.save(entity);
    }

    @PostMapping("/wishes/{id}/reserve")
    public ResponseEntity<WishItemEntity> toggleSecretReservation(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam String userName) {
        return wishItemRepository.findById(id)
                .map(item -> {
                    if ("reservado".equals(item.getSecretStatus()) && userId.equals(item.getReservedByUserId())) {
                        item.setSecretStatus("disponivel");
                        item.setReservedByUserId(null);
                        item.setReservedByName(null);
                    } else {
                        item.setSecretStatus("reservado");
                        item.setReservedByUserId(userId);
                        item.setReservedByName(userName);
                    }
                    return ResponseEntity.ok(wishItemRepository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/wishes/{id}/contribute")
    public ResponseEntity<WishItemEntity> contributeToPool(
            @PathVariable String id,
            @RequestBody ContributionRequest request) {
        return wishItemRepository.findById(id)
                .map(item -> {
                    double target = item.getPoolTargetAmount() > 0 ? item.getPoolTargetAmount() : item.getLowestPrice();
                    double nextTotal = Math.min(target, item.getPoolCollectedAmount() + request.amount());
                    item.setPoolTargetAmount(target);
                    item.setPoolCollectedAmount(nextTotal);
                    item.setSecretStatus(nextTotal >= target ? "comprado" : "vaquinha_ativa");
                    item.getContributions().add(new SecretContributionEmbeddable(
                            request.userId(),
                            request.userName(),
                            request.userAvatar() != null ? request.userAvatar() : "🎁",
                            request.amount(),
                            "Agora mesmo"
                    ));
                    return ResponseEntity.ok(wishItemRepository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/wishes/{id}/comments")
    public ResponseEntity<WishItemEntity> addSecretComment(
            @PathVariable String id,
            @RequestBody SecretCommentRequest request) {
        return wishItemRepository.findById(id)
                .map(item -> {
                    item.getSecretComments().add(new SecretCommentEmbeddable(
                            "c-" + UUID.randomUUID().toString().substring(0, 6),
                            request.authorId(),
                            request.authorName(),
                            request.authorAvatar() != null ? request.authorAvatar() : "🕵️",
                            request.text(),
                            "Agora mesmo"
                    ));
                    return ResponseEntity.ok(wishItemRepository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/clans")
    public List<ClanEntity> listClans() {
        return clanRepository.findAll();
    }

    @PostMapping("/clans")
    public ClanEntity createClan(@RequestBody ClanEntity clan) {
        if (clan.getId() == null || clan.getId().isBlank()) {
            clan.setId("clan-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return clanRepository.save(clan);
    }
}
