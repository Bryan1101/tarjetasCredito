const assert = require('assert');
const sinon = require('sinon');
const axios = require('axios');
const helpers = require('@cce-lib/cce-lib-utils');
const proxyquire = require('proxyquire');

jest.mock('axios', () => jest.fn());

// Importar la función handler
const { handler } = require('../src/app');

describe('handler', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
  it('Respuesta exitosa', async () => {
    // Definir un evento de entrada válido
    const event = {
      customerId: '12345',
      documentNumber: '123456789',
      documentType: 'dni',
      fullname: 'John Doe',
      guId: 'abcdefg',
      deviceIp: '19216801',
      device: 'android',
      sesion_call: 'session123',
    };

    // Mockear las funciones llamadas dentro de la función handler
    sinon.stub(helpers, 'obtenerValorDeSecreto').resolves({
      password: 'anytest',
    });
    sinon.stub(helpers, 'EncryptData').returns({ data: 'encrypted-data' });
    sinon.stub(helpers, 'EncryptDataMD5').returns('encrypted-md5');
    sinon.stub(helpers, 'FirmaForPostRequest').returns('signature');

    const mRes = {
        data: {
          message: 'Transacción exitosa',
        },
      };
    axios.mockResolvedValueOnce(mRes);

    // Ejecutar la función handler
    const result = await handler(event);

    // Comprobar que la respuesta es la esperada
    assert.deepStrictEqual(result, {
      statusCode: 200,
      data_result: '{"message":"Transacción exitosa"}',
    });

    // Restaurar las funciones mockeadas
    sinon.restore();
  });
});

