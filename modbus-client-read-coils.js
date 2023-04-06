const net = require('net');
const { Request } = require('jsmodbus');

const client = new net.Socket();
const PORT = 502;
const HOST = 'localhost';

client.connect(PORT, HOST, () => {
  console.log('Connected to the Modbus server.');

  readCoils(client, 0, 10)
    .then((response) => {
      console.log('Read coils response:', response);

      return writeSingleCoil(client, 0, true);
    })
    .then((response) => {
      console.log('Write single coil response:', response);

      return readHoldingRegisters(client, 0, 5);
    })
    .then((response) => {
      console.log('Read holding registers response:', response);

      return writeSingleRegister(client, 0, 12345);
    })
    .then((response) => {
      console.log('Write single register response:', response);

      client.end();
    })
    .catch((err) => {
      console.log('Error:', err.message);
      client.end();
    });
});

client.on('error', (err) => {
  console.log(`Client error: ${err.message}`);
});

function readCoils(client, startAddress, quantity) {
  const request = Request.buildRequest({
    functionCode: Request.FunctionCodes.ReadCoils,
    startAddress: startAddress,
    quantity: quantity
  });

  return sendRequest(client, request.toBuffer());
}

function writeSingleCoil(client, outputAddress, outputValue) {
  const request = Request.buildRequest({
    functionCode: Request.FunctionCodes.WriteSingleCoil,
    outputAddress: outputAddress,
    outputValue: outputValue
  });

  return sendRequest(client, request.toBuffer());
}

function readHoldingRegisters(client, startAddress, quantity) {
  const request = Request.buildRequest({
    functionCode: Request.FunctionCodes.ReadHoldingRegisters,
    startAddress: startAddress,
    quantity: quantity
  });

  return sendRequest(client, request.toBuffer());
}

function writeSingleRegister(client, registerAddress, registerValue) {
  const request = Request.buildRequest({
    functionCode: Request.FunctionCodes.WriteSingleRegister,
    registerAddress: registerAddress,
    registerValue: registerValue
  });

  return sendRequest(client, request.toBuffer());
}

function sendRequest(client, requestData) {
  return new Promise((resolve, reject) => {
    client.write(requestData);

    client.once('data', (data) => {
      try {
        const response = Request.fromBuffer(data);
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });
  });
}
