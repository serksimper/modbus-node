const net = require ( 'net' );
const { Request } = require ( 'jsmodbus' );

class ModbusTCPServer {
	constructor ( config ) {
		this.config = config;
		this.coilStates = new Map ();
		this.registerStates = new Map ();
	}

	start () {
		this.server = net.createServer ( ( socket ) => {
			console.log ( 'Client connected' );
			socket.on ( 'error', this.handleSocketError.bind ( this ) );
			socket.on ( 'close', this.handleSocketClose.bind ( this ) );
			socket.on ( 'data', this.handleSocketData.bind ( this, socket ) );
		} );

		this.server.listen ( this.config.port, () => {
			console.log (
					`Modbus server is listening on port ${ this.config.port }` );
		} );
	}

	handleSocketError ( err ) {
		console.log ( `Socket error: ${ err.message }` );
	}

	handleSocketClose () {
		console.log ( 'Client disconnected' );
	}

	handleSocketData ( socket, data ) {
		try {
			const request = Request.fromBuffer ( data );
			console.log ( request );

			let response;

			switch ( request.functionCode ) {
				case Request.FunctionCodes.ReadCoils:
					response = this.handleReadCoils ( request );
					break;
				case Request.FunctionCodes.WriteSingleCoil:
					response = this.handleWriteSingleCoil ( request );
					break;
				case Request.FunctionCodes.ReadHoldingRegisters:
					response = this.handleReadHoldingRegisters ( request );
					break;
				case Request.FunctionCodes.WriteSingleRegister:
					response = this.handleWriteSingleRegister ( request );
					break;
				default:
					response = this.handleUnsupportedFunctionCode ( request );
					break;
			}

			socket.write ( Request.buildResponse ( response ).toBuffer () );
		} catch ( err ) {
			console.log ( `Invalid request: ${ err.message }` );
			socket.write ( err.response.toBuffer () );
		}
	}

	handleReadCoils ( request ) {
		// Read coils from memory
		const startAddress = request.startAddress;
		const endAddress = request.startAddress + request.quantity;
		const coils = [];

		for ( let address = startAddress; address < endAddress; address ++ ) {
			coils.push ( this.coilStates.get ( address ) || 0 );
		}

		const payload = Buffer.from ( coils );

		return {
			unitId: request.unitId,
			functionCode: request.functionCode,
			byteCount: payload.length,
			payload: payload,
		};
	}

	handleWriteSingleCoil ( request ) {
		// Write single coil to memory
		this.coilStates.set ( request.outputAddress,
				request.outputValue ? 0xFF : 0x00 );

		return {
			unitId: request.unitId,
			functionCode: request.functionCode,
			outputAddress: request.outputAddress,
			outputValue: request.outputValue,
		};
	}

	handleReadHoldingRegisters ( request ) {
		// Read holding registers from memory
		const startAddress = request.startAddress;
		const endAddress = request.startAddress + request.quantity;
		const registers = [];

		for ( let address = startAddress; address < endAddress; address ++ ) {
			registers.push ( this.registerStates.get ( address ) || 0 );
		}

		const payload = Buffer.alloc ( registers.length * 2 );
		registers.forEach ( ( register, index ) => {
			payload.writeUInt16BE ( register, index *
					2 );
		} );
		return {
			unitId: request.unitId,
			functionCode: request.functionCode,
			byteCount: payload.length,
			payload: payload,
		};
	}

	handleWriteSingleRegister ( request ) {
// Write single holding register to memory
		this.registerStates.set ( request.registerAddress, request.registerValue );
		return {
			unitId: request.unitId,
			functionCode: request.functionCode,
			registerAddress: request.registerAddress,
			registerValue: request.registerValue,
		};
	}

	handleUnsupportedFunctionCode ( request ) {
		console.log ( `Unsupported

		function code : ${request.functionCode}`
	)
		;
		return {
			unitId: request.unitId,
			functionCode: request.functionCode + 0x80,
			exceptionCode: 1, // Function code not supported
		};
	}
}

const serverConfig = {
	port: 502,
};

const modbusServer = new ModbusTCPServer ( serverConfig );
modbusServer.start ();
