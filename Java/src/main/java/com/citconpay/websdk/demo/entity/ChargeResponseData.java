package com.citconpay.websdk.demo.entity;

public class ChargeResponseData {
    private String charge_token;
    public String getCharge_token() {
        return charge_token;
    }
    public void setCharge_token(String charge_token) {
        this.charge_token = charge_token;
    }
    private String transaction_id;
    public String getTransaction_id() {
        return transaction_id;
    }
    public void setTransaction_id(String transaction_id) {
        this.transaction_id = transaction_id;
    }
    private String access_token;
    public String getAccess_token() {
        return access_token;
    }
    public void setAccess_token(String access_token) {
        this.access_token = access_token;
    }
}
