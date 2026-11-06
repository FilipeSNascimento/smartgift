package com.smartgift.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "clans")
public class ClanEntity {

    @Id
    private String id;

    private String name;
    private String inviteCode;
    private String crestIcon;

    @Column(length = 500)
    private String motto;

    private int level;
    private int xpProgress;
    private String themeId;
    private double secretSantaBudget;
    private boolean secretSantaDrawn;

    public ClanEntity() {
    }

    public ClanEntity(String id, String name, String inviteCode, String crestIcon, String motto,
                      int level, int xpProgress, String themeId, double secretSantaBudget, boolean secretSantaDrawn) {
        this.id = id;
        this.name = name;
        this.inviteCode = inviteCode;
        this.crestIcon = crestIcon;
        this.motto = motto;
        this.level = level;
        this.xpProgress = xpProgress;
        this.themeId = themeId;
        this.secretSantaBudget = secretSantaBudget;
        this.secretSantaDrawn = secretSantaDrawn;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }

    public String getCrestIcon() {
        return crestIcon;
    }

    public void setCrestIcon(String crestIcon) {
        this.crestIcon = crestIcon;
    }

    public String getMotto() {
        return motto;
    }

    public void setMotto(String motto) {
        this.motto = motto;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getXpProgress() {
        return xpProgress;
    }

    public void setXpProgress(int xpProgress) {
        this.xpProgress = xpProgress;
    }

    public String getThemeId() {
        return themeId;
    }

    public void setThemeId(String themeId) {
        this.themeId = themeId;
    }

    public double getSecretSantaBudget() {
        return secretSantaBudget;
    }

    public void setSecretSantaBudget(double secretSantaBudget) {
        this.secretSantaBudget = secretSantaBudget;
    }

    public boolean isSecretSantaDrawn() {
        return secretSantaDrawn;
    }

    public void setSecretSantaDrawn(boolean secretSantaDrawn) {
        this.secretSantaDrawn = secretSantaDrawn;
    }
}
