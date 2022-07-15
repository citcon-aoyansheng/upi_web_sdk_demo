package com.citconpay.websdk.demo.entity;

public class PendingChargeRespone {
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

    private PendingChargeData data;
    public PendingChargeData getData() {
        return data;
    }

    public void setData(PendingChargeData data) {
        this.data = data;
    }

}
