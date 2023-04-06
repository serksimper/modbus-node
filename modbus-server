const net = require('net');
const { Response } = require('jsmodbus');

const server = net.createServer((socket) => {
	// Handle incoming data from clients
	socket.on('data', (data) => {
		try {
			const response = new Response().fromRequest(data);
			console.log(response);

			// Always send an empty response back
			socket.write(response.createResponse().toBuffer());
		} catch (err) {
			console.log(err);
		}
	});
});

const PORT = 502;
server.listen(PORT, () => {
	console.log(`Modbus server is listening on port ${PORT}`);
});
