const net = require('net');
const { Request } = require('jsmodbus');

const server = net.createServer((socket) => {
	console.log('Client connected');

	// Handle incoming data from clients
	socket.on('data', (data) => {
		try {
			const request = Request.fromBuffer(data);
			console.log(request);

			switch (request.functionCode) {
				case Request.FunctionCodes.ReadCoils:
					// Handle read coils request
					let response = {
						unitId: request.unitId,
						functionCode: request.functionCode,
						byteCount: 2,
						payload: Buffer.alloc(2)
					};
					response.payload.writeUInt16BE(0b00000001, 0);

					socket.write(Request.buildResponse(response).toBuffer());
					console.log('Coils read');
					break;

				case Request.FunctionCodes.WriteSingleCoil:
					// Handle write single coil request
					let writeSingleCoilResponse = {
						unitId: request.unitId,
						functionCode: request.functionCode,
						outputAddress: request.outputAddress,
						outputValue: request.outputValue
					};
					socket.write(Request.buildResponse(writeSingleCoilResponse).toBuffer());
					console.log('Coil written');
					break;

				default:
					// Handle unsupported function code
					console.log(`Unsupported function code: ${request.functionCode}`);
					let errorResponse = {
						unitId: request.unitId,
						functionCode: request.functionCode + 0x80,
						exceptionCode: 1 // Function code not supported
					};
					socket.write(Request.buildResponse(errorResponse).toBuffer());
					break;
			}
		} catch (err) {
			// Handle invalid requests
			console.log(`Invalid request: ${err.message}`);
			socket.write(err.response.toBuffer());
		}
	});
});

const PORT = 502;
server.listen(PORT, () => {
	console.log(`Modbus server is listening on port ${PORT}`);
});
