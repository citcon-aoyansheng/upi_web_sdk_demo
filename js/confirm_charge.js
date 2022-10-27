'use strict';
// This js is a non-initiated request (confirm charge).

//qa
// var merchantUrl = "https://cybsdev.citconpay.com/web_sdk_phase_1_qa.php";
// var merchantUrl = "https://cybsdev.citconpay.com/web_sdk_uat.php";
// var merchantUrl = "https://cybsdev.citconpay.com/web_sdk_server.php";
let sdkEnv = 'dev'; //dev/dev_eks/qa/uat/prod,
let merchantUrl =
  'https://websdk-demo.dev01.citconpay.com/web_sdk_all.php?env=' + sdkEnv; 
var access_token = null;
var citconInstance = null;
var transactionId = null;
var chargeToken = null;


$( document ).ready(function() {
    if (!citconpay) {
      console.log('CitconSDK not loaded!');
      return;
    }
    console.log(citconpay);

    var  apiUrl = merchantUrl + '&action=access_token&payment_method=' + merchantKey;
    $.ajax({
      url: apiUrl,
      type:'post',
      dataType: 'json',
      success:function(resp){
        console.log('create access token...' + JSON.stringify(resp));
        access_token = resp.data.access_token;

      },
      async:false
    });

     //init sdk
    const configObj = {
        accessToken: access_token,
        environment: sdkEnv, //dev/qa/uat/prod,
        // debug:true,
        consumerID:"115646448",
        languages: getLanguages(),//en for English,zh_CN for Mandarin,fr for French,es for Spanish,this is optional, default is auto
        cardTypes:['VISA','MA'],
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
})

function sdkUIDidInitialized(e){

    console.log(' sdk ui initialized .....' + JSON.stringify(e));
}
function registerEvents(){
    citconInstance.on('payment-method-selected', function (e) {
        console.log('Inside `payment-method-selected` .........' + JSON.stringify(e));
        //when customer select card, show the card input UI
        let options ={
            consumer:{
                id:"115646448"
            },
            payment: {
                totalAmount: parseInt( $("#txtAmount").val()),
                currency:$("#currency").val(),
                countryCode:$("#country").val(),
                transactionReference: '',
                chargeToken:''
            },
          }
          citconInstance.onPaymentMethodSelected(e.paymentMethod,options).then((rest)=>{
            console.log('onPaymentMethodSelected , result' + JSON.stringify(rest));
          }).catch(error=>{
            console.log('onPaymentMethodSelected error:' + JSON.stringify(error));
          });
      });
    
    citconInstance.on('payment-method-submitted', function(e) {
        console.log('....paynow..click.....',e.paymentMethod);
        $("body").addClass("loading");
        let rquestOptions ={
          payment: {
            totalAmount: parseInt( $("#txtAmount").val()),
            currency:$("#currency").val(),
            countryCode:$("#country").val(),
            transactionReference: "",
            chargeToken:"",
            client:'desktop',
            autoCapture: true,
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
    
        switch(e.paymentMethod){
          case 'vault': //test paypal vault
          case 'card':
            rquestOptions ={
              ...rquestOptions,
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
              bothFailedContinue:false,
    
              // goods either does not exist, or all internal parameters must exist
              goods:{
                data:[{
                    name: $("#firstName").val()+' '+$("#lastName").val(),
                    sku:"123456",
                    category:"digital",
                    quantity:1,
                    unitAmount:10000,
                    url: "http://www.goods.com",
                    productType:"product"
                }]
              }
            }
            break;
          case 'gcash': case 'grabpay': case 'paymaya': case 'shopeepay': case 'bpi': case 'ubp': case '7eleven':
              rquestOptions = {
                ...rquestOptions,
                goods:{
                  data:[{
                      name: $("#firstName").val()+' '+$("#lastName").val(),
                      sku:"123456",
                      category:"digital",
                      quantity:1,
                      unitAmount:parseInt( $("#txtAmount").val()),
                      url: "http://www.goods.com",
                      productType:"product"
                  }]
                },
              }
            break;
          case 'billease': case 'cashalo': 
            rquestOptions = {
              ...rquestOptions,
              consumer: {
                ...rquestOptions.consumer,
                street: $("#address").val(),
                city: $("#txtCity").val(),
                zip: $("#zip").val(),
                country: $("#country").val()
              },
              goods:{
                data:[{
                    name: $("#firstName").val()+' '+$("#lastName").val(),
                    sku:"123456",
                    category:"digital",
                    quantity:1,
                    unitAmount:parseInt( $("#txtAmount").val()),
                    url: "http://www.goods.com",
                    productType:"fee"
                }]
              },
            }
          break;
        }
    
        citconInstance.onPaymentMethodSubmitted(e.paymentMethod,rquestOptions).then(rest=>{
          console.log('pay now click, return..' + JSON.stringify(rest));
        }).catch(error=>{
          console.log('pay now click, error..' + JSON.stringify(error));
        });
    
        
    });

    citconInstance.on('vault-item-selected', function(e) {
        // vault item selected, do anything you want for this event
        console.log('....vault item selected.......' + JSON.stringify(e));    
    });
    //on payment status change, this is the event for charge result
    //status: status, status will return "success" or "failed" 
    //retObj: retObj
    citconInstance.on('payment-status-changed', function(e) {
        console.log(e)
        $("body").removeClass("loading");
    });
}

function getLanguages(){
    const language = localStorage.getItem('selectedLanguage');
    if(language == null || language== undefined) return 'auto';
    return language;
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