package com.smartgift.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class StoreOfferEmbeddable {

    private String store;
    private String storeLogo;
    private double price;
    private Double originalPrice;
    private String installments;
    private boolean freeShipping;
    private String url;
    private boolean isCheapest;
    private String lastChecked;

    public StoreOfferEmbeddable() {
    }

    public StoreOfferEmbeddable(String store, String storeLogo, double price, Double originalPrice,
                                String installments, boolean freeShipping, String url, boolean isCheapest, String lastChecked) {
        this.store = store;
        this.storeLogo = storeLogo;
        this.price = price;
        this.originalPrice = originalPrice;
        this.installments = installments;
        this.freeShipping = freeShipping;
        this.url = url;
        this.isCheapest = isCheapest;
        this.lastChecked = lastChecked;
    }

    public String getStore() {
        return store;
    }

    public void setStore(String store) {
        this.store = store;
    }

    public String getStoreLogo() {
        return storeLogo;
    }

    public void setStoreLogo(String storeLogo) {
        this.storeLogo = storeLogo;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public Double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public String getInstallments() {
        return installments;
    }

    public void setInstallments(String installments) {
        this.installments = installments;
    }

    public boolean isFreeShipping() {
        return freeShipping;
    }

    public void setFreeShipping(boolean freeShipping) {
        this.freeShipping = freeShipping;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public boolean getIsCheapest() {
        return isCheapest;
    }

    public void setIsCheapest(boolean cheapest) {
        isCheapest = cheapest;
    }

    public String getLastChecked() {
        return lastChecked;
    }

    public void setLastChecked(String lastChecked) {
        this.lastChecked = lastChecked;
    }
}
