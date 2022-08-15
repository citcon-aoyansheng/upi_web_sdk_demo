'use strict';

let transaction_reference = create_reference(20);
let sdkEnv = 'dev'; //dev/dev_eks/qa/uat/prod,
let merchantUrl = "https://cybsdev.citconpay.com/web_sdk_all.php?env="+sdkEnv; 
let access_token = null;
let citconInstance = null;
let transactionId = null;
let chargeToken = null;

$( document ).ready(function() {
  if (!citconpay) {
    console.log('CitconSDK not loaded!');
    return;
  }
  console.log(citconpay);

  //Step 1: Get Access Token and Charge Token from server
  let  apiUrl = merchantUrl + '&action=create_transaction&payment_method=' + merchantKey;
  $.ajax({
    url: apiUrl,
    type:'post',
    dataType: 'json',
    data: JSON.stringify({
      reference: transaction_reference,
      totalAmount: parseInt($("#txtAmount").val()),
      currency: $("#currency").val(),
      countryCode:$("#country").val(),
    }),
    success:function(resp){
      console.log('create pending transaction...' + JSON.stringify(resp));
      if(resp.status === 'success'){
        access_token = resp.data.access_token;
        chargeToken = resp.data.charge_token;
        transactionId = resp.data.transaction_id;
      }else{
        console.log(resp.data);
      }
    },
    async:false
  });

  //init sdk
  const configObj = {
    accessToken: access_token,
    environment:sdkEnv, 
    debug:true,
    consumerID:"115646448",
    languages: 'en-US',// getLanguages(),//en for English,zh_CN for Mandarin,fr for French,es for Spanish,this is optional, default is auto
    cardTypes:['VISA','AXP','MA','JCB','DFS'],
    threeDSPaymentMethodScope:['debitcard'], // debitcard,creditcard
    urls: {
      ipn: "https://api.huiuh.com/notify0",
      mobile: "http://mobile.com",
      success: "https://baidu.com",
      cancel: "https://jd.com",
      fail: "https://qq.com"
    }
  };

  citconpay.client.core(configObj).then( clientInstance=>{
    console.log(' Init SDK...' + JSON.stringify(clientInstance));
    // mount UI
    citconInstance = clientInstance;

    clientInstance.mount('#citcon-client-container',{
      classname: 'payment-method-select-component',
      paymentMethods: paymentMethodArray,
      selectedPaymentMethod: defaultPaymentMethod,
      citconDropinFormDetail: citconDropins,
    }, sdkUIDidInitialized).then(function(instance) {
      
      console.log('instance ...' + JSON.stringify(instance));
      console.log('dropin ...' + JSON.stringify(instance.dropIn));
      //.....
      registerEvents();
    }).catch(error=>{
      console.log(' mount error:' + JSON.stringify(error));
    });
  }).catch(error=>{
    console.log(' Init SDK error:' + JSON.stringify(error));
  });

  $('#languages').on('change', function (e) {
    var optionSelected = $("option:selected", this);
    var valueSelected = this.value;
    console.log('optionSelected =' + optionSelected + ' valueSelected=' + valueSelected);
    localStorage.setItem('selectedLanguage',valueSelected);
    window.location.reload();
  });
  $("#languages option[value='"+ getLanguages() +"']").attr("selected", "selected");

});

function sdkUIDidInitialized(e){

  console.log(' sdk ui initialized .....' + JSON.stringify(e));
}
function registerEvents(){

  citconInstance.on('payment-method-selected', function (e) {
    console.log('Inside `payment-method-selected` .........' + JSON.stringify(e));
    let selectedPaymentMethod = e.paymentMethod;
    //when customer select card, show the card input UI
    let options ={
        consumer:{
          id:"115646448"
        },
        payment: {
          totalAmount: parseInt( $("#txtAmount").val()),
          currency:$("#currency").val(),
          countryCode:$("#country").val(),
          transactionReference: transaction_reference,
          transactionId: transactionId,
          chargeToken:chargeToken
        },
        goods: {
            shipping: {
                firstName: "fist",
                lastName: "last",
                phone: "string",
                email: "test@citcon.cn",
                street: "3 Main St",
                street2: "",
                city: "CA",
                state: "San Jose",
                zip: "95132",
                country: "US",
                amount: 5,
            },
            data: [{
                name: "shoes",
                sku: "shoes",
                url: "string",
                quantity: 1,
                unitTaxAmount: 10,
                unitAmount: 175,
                totalDiscountAmount: 10,
                category : "PHYSICAL_GOODS"
            }]
        },
        //whether need 3DS
        request3DSecureVerification: true,
        requestInstallment: true,
      }
      citconInstance.onPaymentMethodSelected(e.paymentMethod,options).then((rest)=>{
        console.log('onPaymentMethodSelected , result' + JSON.stringify(rest));
      }).catch(error=>{
        console.log('onPaymentMethodSelected error:' + JSON.stringify(error));
      });
  });

  citconInstance.on('payment-method-submitted', function(e) {
    // UI Event
    // For those payment method Popup Or Redirect, Sucha as Paypal, Venmo
    // merchant handles selection of payment methods through Citcon's UI
    // if need backend to charge, remove chargeToken and billing address
    console.log('....paynow..click.....');
    $("body").addClass("loading");
    switch(e.paymentMethod){
      case 'paylater':
      case 'paypal':
      case 'venmo':
        const rquestOptions ={
          payment: {
            totalAmount: parseInt( $("#txtAmount").val()),
            currency:$("#currency").val(),
            countryCode:$("#country").val(),
            transactionReference: transaction_reference,
            autoCapture: true,
            transactionId: transactionId,
            chargeToken:chargeToken
          },
           billingAddress: {
            street: $("#address").val(),
            street2:$("#address2").val(),
            city: $("#txtCity").val(),
            state: $("#state").val(),
            zip: $("#zip").val(),
            country: $("#country").val()
          },
          consumer:{
            id:"115646448",
            reference: "consumer_web_sdk",
            firstName: $("#firstName").val(),
            lastName: $("#lastName").val(),
            phone: $("#phone").val(),
            email: $("#email").val(),
          },
        }
        citconInstance.onPaymentMethodSubmitted(e.paymentMethod,rquestOptions).then(rest=>{
          console.log('pay now click, return..' + JSON.stringify(rest));
        }).catch(error=>{
          console.log('pay now click, error..' + JSON.stringify(error));
        });
        break;
      case 'xendit':
      case 'vault': //test paypal vault
      case 'card':
        const requestOptions ={
          payment: {
            totalAmount: parseInt( $("#txtAmount").val()),
            currency:$("#currency").val(),
            countryCode:$("#country").val(),
            transactionReference: transaction_reference,
            chargeToken:chargeToken,
            autoCapture:true,
          },
           billingAddress: {
            street: $("#address").val(),
            street2:$("#address2").val(),
            city: $("#txtCity").val(),
            state: $("#state").val(),
            zip: $("#zip").val(),
            country: $("#country").val()
          },
          consumer:{
            id:"115646448",
            reference: "consumer_web_sdk",
            firstName: $("#firstName").val(),
            lastName: $("#lastName").val(),
            phone: $("#phone").val(),
            email: $("#email").val(),
          },
          tax:{
            taxExemptAmount:20
          },
          request3DSecureVerification:true,
          //This two parameter only for braintree card 3DS
          //For liabilityShiftPossible & liabilityShifted, please refer to https://developer.paypal.com/braintree/docs/guides/3d-secure/legacy-3d-secure/client-side
          // liabilityShiftPossibleContinue means when braintree 3DS return liabilityShiftPossible = false whether contine
          // bothFailedContinue means braintree 3DS return liabilityShiftPossible = false AND liabilityShifted = false whether continue ,default is false, 
          // if you set to true, means you will accept the risk
          // for braintree 3DS  testing card, please refer to https://developer.paypal.com/braintree/docs/guides/3d-secure/legacy-3d-secure/testing-go-live
          liabilityShiftPossibleContinue:false,
          bothFailedContinue:false
        }
        citconInstance.onPaymentMethodSubmitted(e.paymentMethod,requestOptions).then(rest=>{
          console.log('pay now click, return..' + JSON.stringify(rest));
        }).catch(error=>{
          console.log('pay now click, error..' + JSON.stringify(error));
        });
        break;
      case 'banktransfer':
      case'lpay':
      case'lgpay':
      case'samsungpay':
      case 'toss':
      case 'oxxopay':
      case 'spei':
      case 'mercadopago':
      case 'oxxo':
          let paymentJSON = {
            totalAmount: parseInt( $("#txtAmount").val()),
            currency:$("#currency").val(),
            countryCode:$("#country").val(),
            transactionReference: transaction_reference,
            // client will be desktop  or mobile_browser
            chargeToken:chargeToken
          }
          const oxxoOptions ={
            payment: paymentJSON,
             billingAddress: {
              street: $("#address").val(),
              street2:$("#address2").val(),
              city: $("#txtCity").val(),
              state: $("#state").val(),
              zip: $("#zip").val(),
              country: $("#country").val()
            },
            consumer:{
              id:"115646448",
              reference: "consumer_web_sdk",
              firstName: $("#firstName").val(),
              lastName: $("#lastName").val(),
              phone: $("#phone").val(),
              email: $("#email").val(),
            },
            tax:{
              taxExemptAmount:20
            }
          }
          citconInstance.onPaymentMethodSubmitted(e.paymentMethod,oxxoOptions).then(rest=>{
            console.log('pay now click, return..' + JSON.stringify(rest));
          }).catch(error=>{
            console.log('pay now click, error..' + JSON.stringify(error));
          });
          break;
    }

    
  });


  citconInstance.on('vault-item-selected', function(e) {
    // vault item selected, do anything you want for this event
    console.log('....vault item selected.......' + JSON.stringify(e));    
  });
  //on payment status change, this is the event for charge result
  //status: status, status will return "success" or "failed" 
  //retObj: retObj
  citconInstance.on('payment-status-changed', function(e) {
     const status = e.status;
     const res = e.data;
     
     console.log('payment-status-changed status..'  + JSON.stringify(e));
     if(status == 'success'){
       //payment success
      if(res && res.payment){
        $("body").removeClass("loading");
        selectedPaymentMethod = res.payment.method;
        let redirectPaymentMethodArray = ['oxxo','oxxopay','spei','mercadopago', 'paypal', 'venmo']
        if(redirectPaymentMethodArray.includes(selectedPaymentMethod)){
          //get redirect url
          let clients = res.payment.client;
          console.log('..clients..' + JSON.stringify(clients));
          //Do redirect or show QR
          clients.map(client=>{
             if(client.format == 'redirect'){
               window.location.href = client.content;
             }
          });
          // default redirect
          window.location.href = 'https://example.com/success'
        }
      }else {
        $("body").removeClass("loading");
      }
     }else{
        $("body").removeClass("loading");
        console.log('An error occurred:', res.message);
     }
  });
}

function InquireOrder(){
  $("body").addClass("loading");
  console.log('inquire order... id=' + transactionId);
  citconInstance.inquire(transactionId).then(resp=>{
    console.log('inquire...return' + JSON.stringify(resp));
    $("body").removeClass("loading");
  }).catch(error=>{
    console.log('inquire order error...' + JSON.stringify(error));
    $("body").removeClass("loading");
  });
}

function GetInstalmentInfo(){
  $("body").addClass("loading");
  const options = {
    amount: 1000,
    currency: 'MXN',
    country: 'MX',
  }
  citconInstance.installments(options).then(resp=>{
    console.log('inquire...return' + JSON.stringify(resp));
    $("body").removeClass("loading");
  }).catch(error=>{
    console.log('inquire order error...' + JSON.stringify(error));
    $("body").removeClass("loading");
  });
}

function getLanguages(){
  if(paymentMethod=='toss') return 'ko-KR';
  const language = localStorage.getItem('selectedLanguage');
  if(language == null || language== undefined) return 'auto';
  return language;
}

function ModifyPayment(){
  $("body").addClass("loading");
  const options ={
    transaction:{
      chargeToken: chargeToken,
      amount: parseInt( $("#txtAmount").val()),
      currency:$("#currency").val(),
    },
  }
  //Toss need to hide or show installment if amount changed
  const paymentMethods =['card', 'banktransfer','toss','lpay','lgpay','samsungpay'];
  if(paymentMethods.includes(selectedPaymentMethod)){
    let options2 ={
      consumer:{
        id:"115646448"
      },
      payment: {
        totalAmount: parseInt( $("#txtAmount").val()),
        currency:$("#currency").val(),
        countryCode:$("#country").val(),
        transactionReference: transaction_reference,
        chargeToken:chargeToken
      },
      requestInstallment: true,
    }
    citconInstance.onPaymentMethodSelected(selectedPaymentMethod,options2).then((rest)=>{
      console.log('onPaymentMethodSelected , result' + JSON.stringify(rest));
    }).catch(error=>{
      console.log('onPaymentMethodSelected error:' + JSON.stringify(error));
    });
  }
  citconInstance.modifyCharge(options).then(resp=>{
    $("body").removeClass("loading");
    console.log('do mofiy charge....'+ JSON.stringify(resp));

    transactionId = resp.data.id;
  }).catch(error=>{
    $("body").removeClass("loading");
    console.log('do mofiy charge error....'+ JSON.stringify(error));
  });  
}

function create_reference(length){
  let result           = '';
  let characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  $("#transactionReference").html('Transaction Reference:' + result);
  return result;
}


(function() {
  'use strict';

  // Validate form on window.load
  window.addEventListener('load', function() {
    [...document.getElementsByTagName('form')].map(function(form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
      }, false);
    });
  }, false);
})();

