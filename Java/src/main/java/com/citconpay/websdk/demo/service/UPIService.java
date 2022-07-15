package com.citconpay.websdk.demo.service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.citconpay.websdk.demo.constant.Const;
import com.citconpay.websdk.demo.entity.AccessTokenResponse;
import com.citconpay.websdk.demo.entity.PendingChargeData;
import com.citconpay.websdk.demo.entity.PendingChargeRespone;
import com.google.gson.Gson;

// import org.apache.log4j.Logger;


@Service
public class UPIService {
    private static final org.apache.logging.log4j.Logger logger = org.apache.logging.log4j.LogManager.getRootLogger();
    @Value("${UsingSandbox}")
    private int usingSandbox;

    @Value("${merchantKey}")
    private String merchantKey;

    private String callUPIAPI(String upiUrl,String token,String data){
        try{
            URL url = new URL(upiUrl);
            HttpURLConnection http = (HttpURLConnection)url.openConnection();
            http.setRequestMethod("POST");
            http.setDoOutput(true);
            http.setRequestProperty("Accept", "application/json");
            http.setRequestProperty("Authorization", "Bearer " + token);
            http.setRequestProperty("Content-Type", "application/json");

            // String data = "{\n	\"employee\":{ \"name\":\"Emma\", \"age\":28, \"city\":\"Boston\" }\n} ";

            byte[] out = data.getBytes(StandardCharsets.UTF_8);

            OutputStream stream = http.getOutputStream();
            stream.write(out);

            System.out.println(http.getResponseCode() + " " + http.getResponseMessage());

            // handle error response code it occurs
            int responseCode = http.getResponseCode();
            InputStream inputStream;
            if (200 <= responseCode && responseCode <= 299) {
                inputStream = http.getInputStream();
            } else {
                inputStream = http.getErrorStream();
            }

            BufferedReader in = new BufferedReader(
                new InputStreamReader(
                    inputStream));

            StringBuilder response = new StringBuilder();
            String currentLine;

            while ((currentLine = in.readLine()) != null) 
                response.append(currentLine);

            in.close();
            System.out.println(response.toString());

            http.disconnect();
            
           
            return response.toString();
        }catch(Exception e){
            logger.error(e.getLocalizedMessage());
            return null;
        }


    } 
    public AccessTokenResponse getAccessToken(){


        String url = Const.getUPIUrl(usingSandbox) + "/access-tokens";
        String data = "{\n	\"token_type\": \"client\"}";
        String resp = callUPIAPI(url,merchantKey,data);
        AccessTokenResponse accessTokenResponse    =  new Gson().fromJson (resp,AccessTokenResponse.class);  

        return accessTokenResponse;
    }
    public PendingChargeData getPendingCharge(String reference,String amount,String currency,String countryCode,String token){
        String data = "{";
        data = data +"\"transaction\": {";
        data = data +"\"reference\": \""+reference+"\",";
        data = data +"\"amount\": "+ amount+",";
        data = data +"\"currency\": \""+currency+"\",";
        data = data +"\"country\": \"" + countryCode +"\",";
        data = data +"\"auto_capture\": false,";
        data = data +"\"urls\": {";
        data = data +"\"ipn\": \"http://ipn.com\",";
        data = data +"\"success\": \"http://success.com\",";
        data = data +"\"fail\": \"http://fail.com\",";
        data = data +"\"mobile\": \"http://mobile.com\",";
        data = data +"\"cancel\": \"http://cancel.com\"";
        data = data +"}";
        data = data +"}";
        data = data +"}";
        System.out.println(data);
        String url = Const.getUPIUrl(usingSandbox) + "/charges";
        String resp = callUPIAPI(url,token,data);
        PendingChargeRespone pendingChargeRespone = new Gson().fromJson(resp, PendingChargeRespone.class);
        return pendingChargeRespone.getData();
    }
}
