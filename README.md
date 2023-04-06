# Modbus Server and Example Client in Node.js

This document explains how the Modbus server and example client work together in Node.js, using the `jsmodbus` library. The server is a simple implementation that supports reading and writing coils and holding registers, while the client demonstrates how to connect to the server and perform these operations.

## Modbus Server

The Modbus server is implemented as a `ModbusTCPServer` class. It uses a TCP server to listen for incoming connections from clients and manages the coil and register states using `Map` objects.

### Server Operations

The server supports the following Modbus function codes:

1. Read Coils (0x01)
2. Write Single Coil (0x05)
3. Read Holding Registers (0x03)
4. Write Single Register (0x06)

For unsupported function codes, the server returns an exception code 0x01 (Function code not supported).

### Server Configuration

The server can be configured using a `serverConfig` object that contains the following properties:

- `port`: The port on which the Modbus server listens for incoming connections.

### Starting the Server

To start the server, create an instance of the `ModbusTCPServer` class with the `serverConfig` object and call the `start()` method.

```javascript
const serverConfig = {
  port: 502
};

const modbusServer = new ModbusTCPServer(serverConfig);
modbusServer.start();
```

### Example Modbus Client
The example Modbus client demonstrates how to connect to the Modbus server and perform read and write operations on coils and holding registers.

### Client Operations
The client performs the following operations:

1. Connect to the Modbus server.
2. Read coils.
3. Write a single coil.
4. Read holding registers.
5. Write a single holding register.
6. Close the connection.

### Connecting to the Server
The client connects to the server using a TCP socket with the server's host and port.

```javascript
const client = new net.Socket();
const PORT = 502;
const HOST = 'localhost';

client.connect(PORT, HOST, () => {
  // Client connected
});
```
### Performing Modbus Operations
The client sends requests to the server using the `sendRequest()` function, which takes a `client` object and a `requestData` buffer.

```javascript
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
```

### Handling Responses and Errors
The client handles responses from the server by resolving the Promise returned by the `sendRequest()` function. If there is an error in the response, the Promise is rejected, and the error is logged.

### Conclusion
The Modbus server and example client provide a simple demonstration of how to implement a Modbus TCP server and client using Node.js and the `jsmodbus` library. This example is a starting point and can be extended to support more complex scenarios, additional function codes, and security features.




