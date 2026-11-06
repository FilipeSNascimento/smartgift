package com.smartgift.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class SecretContributionEmbeddable {

    private String userId;
    private String userName;
    private String userAvatar;
    private double amount;
    private String createdAt;

    public SecretContributionEmbeddable() {
    }

    public SecretContributionEmbeddable(String userId, String userName, String userAvatar, double amount, String createdAt) {
        this.userId = userId;
        this.userName = userName;
        this.userAvatar = userAvatar;
        this.amount = amount;
        this.createdAt = createdAt;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserAvatar() {
        return userAvatar;
    }

    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
