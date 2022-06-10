<?php
header("Access-Control-Allow-Origin: *");
define('API_URL','https://api.qa01.citconpay.com/v1');

header("Content-type: application/json; charset=utf-8");

$action = $_GET['action'];
switch($action){
    case 'access_token':
    {
        //create a pending transaction
        $resp = get_access_token();
        $data_array = json_decode($resp,true);
        if($data_array['status']=='success'){
            $token = $data_array['data']['access_token'];
            $resp_token = array(
                'access_token' => $token
            );
            echo make_response(
                $data_array['status'],
                $resp_token
            );
        }else{
            echo make_respone($data_array['status'], $data_array['data']['message']);
        }
    }
    break;
  case 'create_transaction':
    {
        //create a pending transaction
        $resp = get_access_token();
        $data_array = json_decode($resp,true);
        if($data_array['status']=='success'){
            $token = $data_array['data']['access_token'];
            //do create pending transaction
            $transaction = create_pending_transaction($token);
            $transaction_array = json_decode($transaction,true);
            if($transaction_array['status']=='success'){
                $resp_token = array(
                    'charge_token' => $transaction_array['data']['charge_token'],
                    'transaction_id' => $transaction_array['data']['id'],
                    'access_token' => $token
                );
                echo make_response(
                    $transaction_array['status'],
                    $resp_token
                );
            }else{
                echo make_response(
                    $transaction_array['status'],
                    $transaction_array['data']['message']
                );
            }
        }else{
            echo make_respone($data_array['status'], $data_array['data']['message']);
        }
    }
    break;
case 'client_token':
    {
        $resp = get_access_token();
        $data_array = json_decode($resp,true);
        if($data_array['status']=='success'){
            $token = $data_array['data']['access_token'];
            $client_token = get_client_token($token);
            $client_token_array = json_decode($client_token,true);
            if($client_token_array['status']=='success'){
                echo make_response(
                    $client_token_array['status'],
                    $client_token_array['data']['client_token']
                );
            }else{
                echo make_response(
                    $client_token_array['status'],
                    $client_token_array['data']['message']
                );
            }
        }else{
            echo make_response($data_array['status'], $data_array['data']['message']);
        }
    }
    break;
case 'doPayment':
    $json = file_get_contents('php://input');
    $json_data = json_decode($json,true);
    echo doPayment($json_data['nonce']);
    break;
default:
    break;
}

function get_client_token($token){
    $data = array(
        // "client" => "android",
        // "consumer_id" => "115646448",
        // "gateway" => "braintree"
        "payment" => array(
            "method" => "card"
        ),
        "ext" => array(
            "client" => array(
                "app" => "android",
                "version" => "v0.0.1"
            )
        ),
        "data" => array(
            "consumer_id" => "115646448",
        )
    );
    $url = API_URL .'/config';
    $resp = do_http_post_with_token($url,$token,json_encode($data));
    return $resp;
}

function make_response($status,$data){
    $resp = array(
        'status' => $status,
        'data' => $data
    );
    return json_encode($resp);
}
function create_pending_transaction($token){
    
    $json = file_get_contents('php://input');
    $json_data = json_decode($json,true);
    $urls = array (
        "ipn_url" => "https://dev.citconpay.com",
        "success_url" => "https://dev.citconpay.com",
        "fail_url" =>  "https://dev.citconpay.com",
        "mobile_url" => "https://dev.citconpay.com"
    );
    $transaction = array(
            "reference" => $json_data['reference'],
            "amount"=> $json_data['totalAmount'],
            "currency"=> $json_data['currency'],
            "auto_capture"=> false,
            "country"=> $json_data['countryCode'],
            "urls"=> $urls
    );
    $data_array['transaction'] = $transaction;
    $data = json_encode($data_array);
    $url = API_URL .'/charges';
    $resp = do_http_post_with_token($url,$token,$data);
    return $resp;
}

function doPayment($nonce){
    
    $json = file_get_contents('php://input');
    $json_data = json_decode($json,true);
    $chargeToken = $json_data['chargeToken'];
    $urls = array (
        "ipn_url" => "https://dev.citconpay.com",
        "success_url" => "https://dev.citconpay.com",
        "fail_url" =>  "https://dev.citconpay.com",
        "mobile_url" => "https://dev.citconpay.com"
    );
    $billing_address = array(
            "street" =>  "123 main street",
            "street2" => "",
            "city" => "Chicago",
            "state" => "CA",
            "zip" =>  "60607",
            "country" => "US"
    );
    if(empty($chargeToken)){
        $transaction = array(
            "reference" => $json_data['reference'],
            "country"=> $json_data['country'],
            "amount" => $json_data['totalAmount'],
            "currency" => $json_data['currency'],
            "auto_capture" => true,
        );
    }else{
        $transaction = array(
            "reference" => $json_data['reference'],
            "country"=> $json_data['country'],
        );
    }


    
    $payment = array (
        "method" => "paypal",
        "indicator" => "braintree",
        "request_token" => false,
        "nonce" => $nonce,
        "billing_address" => $billing_address
    );
    $consumer = array (
        "reference" =>  "consumer_test_1",
        "first_name" =>  "John",
        "last_name" =>  "Smith",
        "phone" =>  "4161234567",
        "email" => "test@test.com",
        "ext_data" => array (
            "document_id" => ""
        )
    );
    
    $ext = array(
        "device"=> array(
            "id" => "",
            "ip" => "74.78.74.78",
            "fingerprint" => ""
        )
    );

    $data_array['transaction'] = $transaction;
    $data_array['payment'] = $payment;
    $data_array['consumer'] = $consumer;
    $data_array['urls'] = $urls;
    $data_array['ext'] = $ext;



    $data = json_encode($data_array);
    
    $url = API_URL ."/charges/".$chargeToken;
    $resp = do_http_post_with_token($url,$json_data['access_token'],$data);
    return $resp;
}

function get_access_token(){
    $data = array(
        "token_type" => "client"
    );
    $url = API_URL .'/access-tokens';

    $resp = do_http_post_with_token($url,'sk-development-53e3dfe3bfab5be4c219c78482d77e0c',json_encode($data));
    
    return $resp;
}

function create_transaction_reference(){
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randstring = '';
    for ($i = 0; $i < 10; $i++) {
        $randstring = $randstring.$characters[rand(0, strlen($characters))];
    }
    return $randstring;
}

function do_http_post_with_token($url,$token,$data){
    // $url = API_URL . "/charges";

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    $headers = array(
    "Accept: application/json",
    "Authorization: Bearer ".$token,
    "Content-Type: application/json",
    );
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);

    //for debug only!
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

    $resp = curl_exec($curl);
    curl_close($curl);
    // var_dump($resp);
    return $resp;
}
?>