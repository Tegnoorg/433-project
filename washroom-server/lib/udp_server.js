"use strict";
/*
 * Respond to commands over a websocket to relay UDP commands to a local program
 */

var socketio = require('socket.io');
var http = require('http');
var io;

const { MongoClient } = require('mongodb');
// Connection URI
const uri = "mongodb+srv://lazypotato322:AJ02HbfLZTj1KBpl@cmpt433project.khjnjgn.mongodb.net/"
// Database Name
const dbName = 'myDatabase';
// Create a new MongoClient
const client = new MongoClient(uri);

var dgram = require('dgram');

const options = {
	hostname: '192.168.7.2',
	port: 8088,
	path: '/',
	method: 'GET'
};

exports.listen = function(server) {
	connectToDB();
	// http.get('http://192.168.7.2:8088/', (res) => {
	// 	console.log(res);
	// });
	// const req = http.request(options, (res) => {
	// 	console.log("yabadabadoo");
	// })
	// req.end();
	// fetch('http://192.168.7.2:8088/').catch(e => console.log(e));
	io = socketio.listen(server);
	io.set('log level 1');
	
	// io.connect('http://192.168.7.2:8088/');
	// var socket = io.connect();
	setInterval(getMotionSensorReading, 2000);
	// setInterval(getForceSensorReading, 2000);
	setInterval(getLightSensorReading, 2000);
	// handleCommand(socket);
	// io.sockets.on('connection', function(socket) {
	// 	console.log("ajhdkfadfhaksdfhaklsdfhasdhfhlkjsadflakfhdahsfakjshdfakds");
	// 	// serverStatus();
	// 	// setInterval(updateVolume, 1000, socket);
	// 	// setInterval(updateTempo, 1000, socket);
	// 	// setInterval(updateMode, 1000, socket);
	// 	// setInterval(updateStatus, 1000, socket);
	// });

};

var PORT = 12345;
var HOST = '192.168.7.2';
// var client = dgram.createSocket('udp4');

// function handleCommand(socket) {

// 	// Pased string of comamnd to relay
// 	socket.on('daUdpCommand', function(data) {
// 		console.log('daUdpCommand command: ' + data);

// 		// Info for connecting to the local process via UDP
// 		// var PORT = 12345;
// 		// var HOST = '192.168.7.2';
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
// 			//

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


var lastMotionSensorReading = '2';
function getMotionSensorReading() {
	var client = dgram.createSocket('udp4');
	var buffer = "motion";
	client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
		if (err) 
			throw err;
		console.log('UDP message sent to ' + HOST +':'+ PORT);
	});

	client.on('listening', function () {
		var address = client.address();
		console.log('UDP Client: listening on ' + address.address + ":" + address.port);
	});
	client.on('message', function (message, remote) {
		console.log("UDP Client: message Rx" + remote.address + ':' + remote.port +' - ' + message);
		let newReading = message.toString('utf-8');
		if (lastMotionSensorReading !== newReading) {
			lastMotionSensorReading = newReading;
			//update db
			updateDB(newReading);
			console.log('update db');
		}

		client.close();

	});
}

var lastForceSensorReading = '2';
function getForceSensorReading() {
	var client = dgram.createSocket('udp4');
	var buffer = "force";
	client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
		if (err) 
			throw err;
		console.log('UDP message sent to ' + HOST +':'+ PORT);
	});

	client.on('listening', function () {
		var address = client.address();
		console.log('UDP Client: listening on ' + address.address + ":" + address.port);
	});
	client.on('message', function (message, remote) {
		console.log("UDP Client: message Rx" + remote.address + ':' + remote.port +' - ' + message);
		let newReading = message.toString('utf-8');
		if (lastForceSensorReading !== newReading) {
			lastForceSensorReading = newReading;
			//update db
			updateDB(newReading);
			console.log('update db');
		}

		client.close();

	});
}

var lastLightSensorReading = '2'
function getLightSensorReading() {
	var client = dgram.createSocket('udp4');
	var buffer = "light";
	client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
		if (err) 
			throw err;
		console.log('UDP message sent to ' + HOST +':'+ PORT);
	});

	client.on('listening', function () {
		var address = client.address();
		console.log('UDP Client: listening on ' + address.address + ":" + address.port);
	});
	client.on('message', function (message, remote) {
		console.log("UDP Client: message Rx" + remote.address + ':' + remote.port +' - ' + message);
		let newReading = message.toString('utf-8');
		if (lastLightSensorReading !== newReading) {
			lastLightSensorReading = newReading;
			//update db
			updateDB2(newReading);
			console.log('update db2');
		}

		client.close();

	});
}

async function updateDB(toSet){
	try {
        // Connect the client to the server
        // await client.connect();
        // console.log('Connected to MongoDB');

        // Use the specified database
        const db = client.db(dbName);
        const collection = db.collection("availability");
        // update
        const documents = await collection.updateOne({beaglebone: 2}, {$set: {isAvailable: toSet}});
        // const result = await db.collection('availability').insertOne({ name: 'John Doe', true: 30 });
        console.log(documents);
        // Your query code here...
    } catch (e) {
		console.log(e);
	} finally {
        // Close the client
        // await client.close();
        // console.log('Disconnected from MongoDB');
    }
}

async function updateDB2(toSet){
	try {
        // Connect the client to the server
        // await client.connect();
        // console.log('Connected to MongoDB');

        // Use the specified database
        const db = client.db(dbName);
        const collection = db.collection("availability");
        // update
        const documents = await collection.updateOne({beaglebone: 2}, {$set: {lightOn: toSet}});
        // const result = await db.collection('availability').insertOne({ name: 'John Doe', true: 30 });
        console.log(documents);
        // Your query code here...
    } catch (e) {
		console.log(e);
	} finally {
        // Close the client
        // await client.close();
        // console.log('Disconnected from MongoDB');
    }
}

async function connectToDB() {
	await client.connect();
	console.log('Connected to MongoDB');
}

