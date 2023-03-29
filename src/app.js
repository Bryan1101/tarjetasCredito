'use strict';


const helpers = require('/opt/helpers');
const axios = require("axios");

//Nombre secretos
const lambdaSecretName = "lambda-secret-key";
const lambdaSecretApi = "lambda-secret-api";
const lambdaSecretApigeeCredentials = "lambda-secret-apigeecredential";
const lambdaSecretVector = "lambda-secret-vector";

exports.handler = async (event) => {
  const secret1 = await helpers.obtenerValorDeSecreto(lambdaSecretName);
  const secret2 = await helpers.obtenerValorDeSecreto(lambdaSecretApi);
  const secret3 = await helpers.obtenerValorDeSecreto(
    lambdaSecretApigeeCredentials
  );
  const secret5 = await helpers.obtenerValorDeSecreto(lambdaSecretVector);
  const customerId = event.customerId;
  const documentNumber = event.documentNumber;
  const documentType = event.documentType;
  const fullname = event.fullname;
  const guId = event.guId;
  const deviceIp = event.deviceIp;
  const device = event.device;
  const sesion_call = event.sesion_call;
  const apiSecret = secret2.password;
  const apiGeeCretials = secret3.password;
  /*Para Encriptación*/
  const key = secret1.password;
  const vector = secret5.password;
  /**/
  const uri = process.env.uri;
  const appId = process.env.appId;
  let responseEnd = "";

  const customerIdEncrypt = helpers.EncryptData(customerId, key, vector).data;
  const documentNumberEncrypt = helpers.EncryptData(
    documentNumber,
    key,
    vector
  ).data;
  const fullnameEncrypt = helpers.EncryptData(fullname, key, vector).data;

  let bodyToSend = {
    data: {
      requester: {
        customerId: customerIdEncrypt,
        documentNumber: documentNumberEncrypt,
        documentType: documentType,
        fullname: fullnameEncrypt
      },
      costsCenterCode: 8426,
      lifeTime: 5,
      recipient: {
        transactionalContact: {
          notifyToEmail: true,
          notifyToCellphone: true
        }
      }
    }
  };

  const xguidEncrypt = helpers.EncryptDataMD5(guId);
  const firmaSegmento = helpers.FirmaForPostRequest(
    appId,
    xguidEncrypt,
    bodyToSend.data,
    apiSecret
  );

  try {
    let config = {
      method: "post",
      url: uri,
      data: bodyToSend,
      headers: {
        "X-Apigee-Credentials": apiGeeCretials,
        "X-Device-Ip": deviceIp,
        "X-Guid": xguidEncrypt,
        "X-Session": sesion_call,
        "X-Device": device,
        "X-Signature": firmaSegmento
      }
    };

    await axios(config)
      .then(async function (response) {
        responseEnd = {
          statusCode: 200,
          data_result: JSON.stringify(response.data)
        };
      })
      .catch(function (error) {
        console.error(error);
        responseEnd = {
          statusCode: 505,
          error: error
        };
      });
  } catch (error) {
    console.error(error);
  }

  return responseEnd;
};