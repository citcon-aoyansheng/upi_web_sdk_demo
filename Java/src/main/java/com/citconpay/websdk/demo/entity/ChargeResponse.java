package com.citconpay.websdk.demo.entity;

public class ChargeResponse {
  private String status;
  private ChargeResponseData data;


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public ChargeResponseData getData() {
        return data;
    }

    public void setData(ChargeResponseData data) {
        this.data = data;
    }
}
