package com.citconpay.websdk.demo.controller;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.citconpay.websdk.demo.entity.ChargeResponseData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
// import org.apache.log4j.Logger;

import com.citconpay.websdk.demo.entity.AccessTokenResponse;
import com.citconpay.websdk.demo.entity.ChargeResponse;
import com.citconpay.websdk.demo.entity.PendingChargeData;
import com.citconpay.websdk.demo.service.UPIService;


@RestController
@RequestMapping("/upi")
public class UPIController {
    private static final org.apache.logging.log4j.Logger logger = org.apache.logging.log4j.LogManager.getRootLogger();
    // private static final Logger corelogger =   (org.apache.logging.log4j.core.Logger)logger;
    @Autowired
    private UPIService upiService;

    @RequestMapping(value = "create_transaction", method = RequestMethod.POST)
    public ChargeResponse createTransaction(@RequestBody Map<String, String> requestMap, HttpServletRequest request) {
        try{
            String reference = requestMap.get("reference");
            String totalAmount = requestMap.get("totalAmount");
            String currency = requestMap.get("currency");
            String countryCode = requestMap.get("countryCode");

            //Step 1: get access token, you can store it at redis and re-generate it before it expired
            //For this demo. skip it
            AccessTokenResponse tokenResponse = upiService.getAccessToken();

            //Step 2: create pending charge
            PendingChargeData pendingChargeData = upiService.getPendingCharge(reference, totalAmount, currency, countryCode,tokenResponse.getData().getAccess_token());

            ChargeResponse chargeResponse = new ChargeResponse();
            chargeResponse.setStatus("success");
            ChargeResponseData chargeResponseData = new ChargeResponseData();
            chargeResponseData.setAccess_token(tokenResponse.getData().getAccess_token());
            chargeResponseData.setCharge_token(pendingChargeData.getCharge_token());
            chargeResponseData.setTransaction_id(pendingChargeData.getId());
            chargeResponse.setData(chargeResponseData);
            return chargeResponse;
        }catch(Exception e){
            logger.debug("reset password,error="+e.getLocalizedMessage());
            return null;
        }
    }
    // @RequestMapping(value = "access_token", method = RequestMethod.POST)
    // public AccessTokenResponse access_token(@RequestBody Map<String, String> requestMap, HttpServletRequest request) {
    //     try{
    //         AccessTokenResponse json = upiService.getAccessToken();
    //         return json;
    //     }catch(Exception e){
    //         logger.debug("reset password,error="+e.getLocalizedMessage());
    //         return null;
    //     }
    // }
}
