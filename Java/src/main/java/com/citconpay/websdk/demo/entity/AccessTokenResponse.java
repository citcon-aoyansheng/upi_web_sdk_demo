package com.citconpay.websdk.demo.entity;

public class AccessTokenResponse {
    private String status;
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    private String app;
    public String getApp() {
        return app;
    }

    public void setApp(String app) {
        this.app = app;
    }

    private String version;

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    private AccessTokenData data;
    public AccessTokenData getData() {
        return data;
    }

    public void setData(AccessTokenData data) {
        this.data = data;
    }

}
