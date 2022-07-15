package com.citconpay.websdk.demo.entity;

public class PendingChargeData {
   private String object;
   public String getObject() {
    return object;
    }
    public void setObject(String object) {
        this.object = object;
    }
    private String charge_token;
   public String getCharge_token() {
        return charge_token;
    }
    public void setCharge_token(String charge_token) {
        this.charge_token = charge_token;
    }
private String id;
   public String getId() {
    return id;
}
public void setId(String id) {
    this.id = id;
}
private String reference;
   public String getReference() {
    return reference;
}
public void setReference(String reference) {
    this.reference = reference;
}
private int amount;
   public int getAmount() {
    return amount;
}
public void setAmount(int amount) {
    this.amount = amount;
}
private String currency;
   public String getCurrency() {
    return currency;
}
public void setCurrency(String currency) {
    this.currency = currency;
}
private Long time_created;
   public Long getTime_created() {
    return time_created;
}
public void setTime_created(Long time_created) {
    this.time_created = time_created;
}
private Long time_captured;
   public Long getTime_captured() {
    return time_captured;
}
public void setTime_captured(Long time_captured) {
    this.time_captured = time_captured;
}
private String status;
   public String getStatus() {
    return status;
}
public void setStatus(String status) {
    this.status = status;
}
private String country;
public String getCountry() {
    return country;
}
public void setCountry(String country) {
    this.country = country;
}
        
    
}
