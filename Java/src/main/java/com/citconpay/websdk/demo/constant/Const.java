package com.citconpay.websdk.demo.constant;

public class Const {
    private final static String sandboxUrl = "https://api.sandbox.citconpay.com/v1";
    private final static String productionUrl = "https://api.citconpay.com/v1";

    public static String getUPIUrl(int usingSandbox){
        return usingSandbox == 1 ? sandboxUrl : productionUrl;
    }

}
