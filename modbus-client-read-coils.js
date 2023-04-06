const Modbus = require('jsmodbus');
const net = require('net');

const socket = new net.Socket();
const client = new Modbus.client.TCP(socket, 1);

socket.connect(502, '127.0.0.1', () => {
	console.log(`Opening socket connection to modbus server`);
	client.readCoils(0, 8, (err, data) => {
		console.log(data);
		socket.end();
	});
});
