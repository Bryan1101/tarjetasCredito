
const helpers = require('/opt/helpers');
const axios = require('axios');

exports.handler = async(event)=>{
    const customerId = event.customerId;
    const documentNumber = event.documentNumber;
    const documentType = event.documentType;
    const fullname = event.fullname;
    const private_key = event.privateKey;
    const vector = event.vector;
    const apiSecret = event.apiSecret;
    const uri = event.uri;
    const appId = event.appId;
    const guId = event.guId;
    const apiGeeCretials = event.apiGeeCretials;
    const deviceIp = event.deviceIp;
    const device = event.device;
    const sesion_call = event.sesion_call;
    let responseEnd = '';
    

  
    const documentNumberEncrypt = helpers.EncryptData(documentNumber,private_key,vector).dataEncode;   
    const xguidEncrypt = helpers.EncryptDataMD5(guId);
     const urlSegmento=event.uri+"?documentNumber="+documentNumberEncrypt
    const firmaSegmento =helpers.GetSignatureForGetRequest(appId, xguidEncrypt, urlSegmento, apiSecret);
    

    try{

        var config = {
            method: 'get',
            url: urlSegmento,
            headers: {
                'X-Api-Credentials':apiGeeCretials,
                'X-Device-Ip':deviceIp,
                'X-Guid': xguidEncrypt,
                'X-Session': sesion_call,
                'X-Device': device,
                'X-Signature': firmaSegmento                
            }
        };
        console.log(config);

     try{
      const rawData = await axios(config) 
      let  responseData= [];
      if(!rawData.data.data){return};
      
      for (let i =0;i<rawData.data.data.length;i++){
      responseData[i] = {
        "entityCode":rawData.data.data[i].entityCode,
        "brandCode":helpers.DecryptData(rawData.data.data[i].brandCode,private_key,vector),
        "creditCardId":rawData.data.data[i].creditCardId, // Sin Desencriptar
        "maskedCreditCardNumber":helpers.DecryptData(rawData.data.data[i].maskedCreditCardNumber,private_key,vector),
        "isPrepaid": rawData.data.data[i].isPrepaid,
        "product": {
            "code": rawData.data.data[i].product.code,
            "description": helpers.DecryptData(rawData.data.data[i].product.description,private_key,vector)
        },
        "paymentMethod": {
            "automaticDebit": {
                "accountId": rawData.data.data[i].paymentMethod.automaticDebit.accountId, //Sin Desencriptar
                "maskedAccountNumber":helpers.DecryptData(rawData.data.data[i].paymentMethod.automaticDebit.maskedAccountNumber,private_key,vector)
            }
        },
        "partner": {
            "type": {
                "code": rawData.data.data[i].partner.type.code, //Sin Desencriptar
               "description":  rawData.data.data[i].partner.type.description //Sin Desencriptar
            },
            "fullname": helpers.DecryptData(rawData.data.data[i].partner.fullname,private_key,vector)
        },
         "billPayment":{
            "date": helpers.DecryptData(rawData.data.data[i].billPayment.date,private_key,vector),
            "minimumAmount": helpers.DecryptData(rawData.data.data[i].billPayment.minimumAmount,private_key,vector),
            "totalAmount": helpers.DecryptData(rawData.data.data[i].billPayment.totalAmount,private_key,vector)
         }
      };
            
      }
      responseEnd = {
                statusCode: 200,
                data_result : JSON.stringify(responseData)  
                
            };   

          }catch (error) {
            console.error(error);            
            responseEnd = {
                statusCode: 505,
                  error: error
               };                
        };
        
    } catch (error) {
        console.error(error);
    }      
    return responseEnd;
}