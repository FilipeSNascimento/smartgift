package com.smartgift.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wish_items")
public class WishItemEntity {

    @Id
    private String id;

    private String ownerId;
    private String ownerName;
    private String title;
    private String category;

    @Column(length = 1000)
    private String imageUrl;

    @Column(length = 1000)
    private String originalUrl;

    private String priority;

    @Column(length = 1000)
    private String notesFromOwner;

    private double lowestPrice;
    private double highestPrice;
    private double savingsAmount;
    private int savingsPercent;
    private String priceHistoryLabel;

    // Dados Secretos ("Sem Spoiler" — protegidos pelo SpoilerFreeGuardService)
    private String secretStatus;
    private String reservedByUserId;
    private String reservedByName;
    private double poolTargetAmount;
    private double poolCollectedAmount;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "wish_item_offers", joinColumns = @JoinColumn(name = "wish_item_id"))
    private List<StoreOfferEmbeddable> offers = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "wish_item_contributions", joinColumns = @JoinColumn(name = "wish_item_id"))
    private List<SecretContributionEmbeddable> contributions = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "wish_item_comments", joinColumns = @JoinColumn(name = "wish_item_id"))
    private List<SecretCommentEmbeddable> secretComments = new ArrayList<>();

    public WishItemEntity() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getOriginalUrl() {
        return originalUrl;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getNotesFromOwner() {
        return notesFromOwner;
    }

    public void setNotesFromOwner(String notesFromOwner) {
        this.notesFromOwner = notesFromOwner;
    }

    public double getLowestPrice() {
        return lowestPrice;
    }

    public void setLowestPrice(double lowestPrice) {
        this.lowestPrice = lowestPrice;
    }

    public double getHighestPrice() {
        return highestPrice;
    }

    public void setHighestPrice(double highestPrice) {
        this.highestPrice = highestPrice;
    }

    public double getSavingsAmount() {
        return savingsAmount;
    }

    public void setSavingsAmount(double savingsAmount) {
        this.savingsAmount = savingsAmount;
    }

    public int getSavingsPercent() {
        return savingsPercent;
    }

    public void setSavingsPercent(int savingsPercent) {
        this.savingsPercent = savingsPercent;
    }

    public String getPriceHistoryLabel() {
        return priceHistoryLabel;
    }

    public void setPriceHistoryLabel(String priceHistoryLabel) {
        this.priceHistoryLabel = priceHistoryLabel;
    }

    public String getSecretStatus() {
        return secretStatus;
    }

    public void setSecretStatus(String secretStatus) {
        this.secretStatus = secretStatus;
    }

    public String getReservedByUserId() {
        return reservedByUserId;
    }

    public void setReservedByUserId(String reservedByUserId) {
        this.reservedByUserId = reservedByUserId;
    }

    public String getReservedByName() {
        return reservedByName;
    }

    public void setReservedByName(String reservedByName) {
        this.reservedByName = reservedByName;
    }

    public double getPoolTargetAmount() {
        return poolTargetAmount;
    }

    public void setPoolTargetAmount(double poolTargetAmount) {
        this.poolTargetAmount = poolTargetAmount;
    }

    public double getPoolCollectedAmount() {
        return poolCollectedAmount;
    }

    public void setPoolCollectedAmount(double poolCollectedAmount) {
        this.poolCollectedAmount = poolCollectedAmount;
    }

    public List<StoreOfferEmbeddable> getOffers() {
        return offers;
    }

    public void setOffers(List<StoreOfferEmbeddable> offers) {
        this.offers = offers;
    }

    public List<SecretContributionEmbeddable> getContributions() {
        return contributions;
    }

    public void setContributions(List<SecretContributionEmbeddable> contributions) {
        this.contributions = contributions;
    }

    public List<SecretCommentEmbeddable> getSecretComments() {
        return secretComments;
    }

    public void setSecretComments(List<SecretCommentEmbeddable> secretComments) {
        this.secretComments = secretComments;
    }
}
