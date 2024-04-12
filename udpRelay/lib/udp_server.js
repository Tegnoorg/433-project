"use strict";
/*
 * Respond to commands over a websocket to relay UDP commands to a local program
 */
const { MongoClient } = require('mongodb');
// Connection URI
const uri = "mongodb+srv://lazypotato322:AJ02HbfLZTj1KBpl@cmpt433project.khjnjgn.mongodb.net/"
// Database Name
const dbName = 'myDatabase';
// Create a new MongoClient
const client = new MongoClient(uri);

var socketio = require('socket.io');
var io;

var dgram = require('dgram');

exports.listen = function(server) {
	io = socketio.listen(server);
	io.set('log level 1');

	io.sockets.on('connection', function(socket) {
		// setInterval(updateVolume, 1000, socket);
		// setInterval(updateTempo, 1000, socket);
		setInterval(updateMotionReading, 2000, socket);
		// setInterval(updateStatus, 1000, socket);
		// handleCommand(socket);
	});

};

// Info for connecting to the local process via UDP
var PORT = 12345;
var HOST = '192.168.7.2';

// function handleCommand(socket) {

// 	// Pased string of comamnd to relay
// 	socket.on('daUdpCommand', function(data) {
// 		console.log('daUdpCommand command: ' + data);

// 		var buffer = new Buffer(data);

// 		var client = dgram.createSocket('udp4');
// 		client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
// 			if (err) 
// 				throw err;
// 			console.log('UDP message sent to ' + HOST +':'+ PORT);
// 		});

// 		client.on('listening', function () {
// 			var address = client.address();
// 			console.log('UDP Client: listening on ' + address.address + ":" + address.port);
// 		});
// 		// Handle an incoming message over the UDP from the local application.
// 		client.on('message', function (message, remote) {
// 			console.log("UDP Client: message Rx" + remote.address + ':' + remote.port +' - ' + message);

// 			var reply = message.toString('utf8')
// 			socket.emit('commandReply', reply);

// 			client.close();

// 		});
// 		client.on("UDP Client: close", function() {
// 			console.log("closed");
// 		});
// 		client.on("UDP Client: error", function(err) {
// 			console.log("error: ",err);
// 		});
// 	});
// };
// function updateVolume(socket) {
// 	var client = dgram.createSocket('udp4');
// 	var buffer = "volume";
// 	client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
// 		if (err) 
// 			throw err;
// 		// console.log('UDP message sent to ' + HOST +':'+ PORT);
// 	});

// 	client.on('listening', function () {
// 		var address = client.address();
// 		// console.log('UDP Client: listening on ' + address.address + ":" + address.port);
// 	});
// 	client.on('message', function (message, remote) {
// 		// console.log("UDP Client: message Rx" + remote.address + ':' + remote.port +' - ' + message);

// 		var reply = message.toString('utf8')
// 		socket.emit('commandReply', reply);

// 		client.close();

// 	});
// }

function updateMotionReading(socket) {
	var client = dgram.createSocket('udp4');
	// var buffer = "tempo";
	// client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
	// 	if (err) 
	// 		throw err;
	// 	// console.log('UDP message sent to ' + HOST +':'+ PORT);
	// });

	client.on('listening', function () {
		var address = client.address();
		// console.log('UDP Client: listening on ' + address.address + ":" + address.port);
	});
	// console.log("hioahdfioashdfaoishdoaishdfoaisdhfaosidhfasoifhasoidhf");
	getDB(socket);
	// console.log(`dasjkflsdfklasdjkfklsdjflaksdjflsakdjflaksjdfalskdfjalk: ${motionDetected}`);
	// var reply = "motion2 ";
	// if (motionDetected == '1') {
	// 	reply += 'Yes'
	// } else {
	// 	reply += 'No'
	// }
	// // var reply = message.toString('utf8')
	// socket.emit('commandReply', reply);
	client.on('message', function (message, remote) {
		// console.log("UDP Client: message Rx" + remote.address + ':' + remote.port +' - ' + message);

		client.close();

	});
}

// function updateMode(socket) {
// 	var client = dgram.createSocket('udp4');
// 	// var buffer = "curmode";
// 	// client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
// 	// 	if (err) 
// 	// 		throw err;
// 	// 	// console.log('UDP message sent to ' + HOST +':'+ PORT);
// 	// });

// 	client.on('listening', function () {
// 		var address = client.address();
// 		// console.log('UDP Client: listening on ' + address.address + ":" + address.port);
// 	});
// 	client.on('message', function (message, remote) {
// 		// console.log("UDP Client: message Rx" + remote.address + ':' + remote.port +' - ' + message);

// 		var reply = message.toString('utf8')
// 		socket.emit('commandReply', reply);

// 		client.close();

// 	});
// }

// function updateStatus(socket) {
// 	var client = dgram.createSocket('udp4');
// 	var buffer = "uptime";
// 	client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
// 		if (err) 
// 			throw err;
// 		// console.log('UDP message sent to ' + HOST +':'+ PORT);
// 	});

// 	client.on('listening', function () {
// 		var address = client.address();
// 		// console.log('UDP Client: listening on ' + address.address + ":" + address.port);
// 	});
// 	var errorTimer = setTimeout(function() {
// 		var reply = "error beatboxNotRunning".toString('utf8')
// 		socket.emit("commandReply", reply)
// 	}, 1000)
// 	client.on('message', function (message, remote) {
// 		clearTimeout(errorTimer);

// 		// console.log("UDP Client: message Rx" + remote.address + ':' + remote.port +' - ' + message);

// 		var reply = message.toString('utf8')
// 		socket.emit('commandReply', reply);

// 		client.close();

// 	});
// }

async function getDB(socket){
	try {
        // Connect the client to the server
        await client.connect();
        console.log('Connected to MongoDB');

        // Use the specified database
        const db = client.db(dbName);
        const collection = db.collection("availability");
        // update
        const documents = await collection.find({}).toArray();
		console.log(documents);
        var motionDetected = documents[0].isAvailable;
		var reply = "motion2 ";
		if (motionDetected == '1') {
			reply += 'Yes'
		} else {
			reply += 'No'
		}
		socket.emit('commandReply', reply);
    } finally {
        // Close the client
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}