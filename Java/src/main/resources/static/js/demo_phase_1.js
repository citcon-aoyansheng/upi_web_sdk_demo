'use strict';

var transaction_reference = create_reference(20);

var merchantUrl = "http://localhost:8000/upi/create_transaction";
var access_token = null;
var citconInstance = null;
var transactionId = null;
var chargeToken = null;

$( document ).ready(function() {
  if (!citconpay) {
    console.log('CitconSDK not loaded!');
    return;
  }
  //Step 1: Get Access Token and Pending charge from server
  $.ajax({
    url: merchantUrl,
    type:'post',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({
      reference: transaction_reference,
      totalAmount: parseInt($("#txtAmount").val()),
      currency: $("#currency").val(),
      countryCode:$("#country").val(),
      autoCapture: false
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
    environment: 'uat', //dev/qa/uat/prod,
    debug:true,
    consumerID:"18000"
  };

  console.log(' citconpay...' + JSON.stringify(citconpay));

  citconpay.client.core(configObj).then( clientInstance=>{
    console.log(' Init SDK...' + JSON.stringify(clientInstance));
    // mount UI
    citconInstance = clientInstance;

    clientInstance.mount('#citcon-client-container',{
      classname: 'payment-method-select-component',
      paymentMethods: paymentMethodArray,
      selectedPaymentMethod: defaultPaymentMethod,
      citconDropinFormDetail: {
        additionalFields: {}
      },
    }, sdkUIDidInitialized).then(function(instance) {
      
      console.log('instance ...' + JSON.stringify(instance));
      //.....
      registerEvents();
    }).catch(error=>{
      console.log(' mount error:' + JSON.stringify(error));
    });
  }).catch(error=>{
    console.log(' Init SDK error:' + JSON.stringify(error));
  });;

});

function sdkUIDidInitialized(e){

  console.log(' sdk ui initialized .....' + JSON.stringify(e));
}
function registerEvents(){
  citconInstance.on('payment-method-selected', function (e) {
    console.log('Inside `payment-method-selected` .........' + JSON.stringify(e));
    //Do you code here
  });

  citconInstance.on('payment-method-submitted', function(e) {
    console.log('....paynow..click.....');
    $("body").addClass("loading");
    const paypalOptions ={
      payment: {
        totalAmount: parseInt( $("#txtAmount").val()),
        currency:$("#currency").val(),
        countryCode:$("#country").val(),
        transactionReference: transaction_reference,
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
        id:"18000",
        reference: "consumer_test_1",
        firstName: $("#firstName").val(),
        lastName: $("#lastName").val(),
        phone: $("#phone").val(),
        email: $("#email").val(),
      }
    }
    switch(e.paymentMethod){
      case 'venmo':
      case 'paypal':
        citconInstance.onPaymentMethodSubmitted(e.paymentMethod,paypalOptions).then(rest=>{
          console.log('pay now click, return..' + JSON.stringify(rest));
        }).catch(error=>{
          $("body").removeClass("loading");
          console.log('pay now click, error..' + JSON.stringify(error));
        });
        break;
    }

  });

  //on payment status change, this is the event for charge result
  //status: status, status will return "success" or "failed" 
  //retObj: retObj
  citconInstance.on('payment-status-changed', function(e) {
     const status = e.status;
     const res = e.data;
     
     console.log('payment-status-changed status..' + status + JSON.stringify(res));
     if(status == 'success'){
       //Phase 1, confirm charge in WebSDK
       if(res && res.payment){
        $("body").removeClass("loading");
        // window.location.href ='checkout_success.html';
      }else {
        $("body").removeClass("loading");
      }
     }else{
      $("body").removeClass("loading");
      console.log('An error occurred:', res.message);
        // window.location.href = "checkout_fail.html";
        
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

function ModifyPayment(){
  $("body").addClass("loading");
  console.log(' modify payment amount: ' +$("#txtAmount").val());
  const options ={
    transaction:{
      chargeToken: chargeToken,
      amount: parseInt( $("#txtAmount").val()),
      currency:$("#currency").val(),
    },
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
  var result           = '';
  var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
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

