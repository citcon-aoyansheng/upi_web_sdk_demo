package com.citconpay.websdk.demo.entity;

public class AccessTokenData {
    private String access_token;
    public String getAccess_token() {
        return access_token;
    }
    public void setAccess_token(String access_token) {
        this.access_token = access_token;
    }
    private Long expiry;
    public Long getExpiry() {
        return expiry;
    }
    public void setExpiry(Long expiry) {
        this.expiry = expiry;
    }
    private String[]  permission;
    public String[] getPermission() {
        return permission;
    }
    public void setPermission(String[] permission) {
        this.permission = permission;
    }
}
