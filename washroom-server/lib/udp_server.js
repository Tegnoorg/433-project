"use strict";
/*
 * Respond to commands over a websocket to relay UDP commands to a local program
 */

var socketio = require('socket.io');
var io;

const { MongoClient } = require('mongodb');
// Connection URI
const uri = "mongodb+srv://lazypotato322:AJ02HbfLZTj1KBpl@cmpt433project.khjnjgn.mongodb.net/"
// Database Name
const dbName = 'myDatabase';
// Create a new MongoClient
const client = new MongoClient(uri);

var dgram = require('dgram');

exports.listen = function(server) {
	connectToDB();
	io = socketio.listen(server);
	io.set('log level 1');
	
	setInterval(getMotionSensorReading, 2000);
	// setInterval(getForceSensorReading, 2000); // teg
	setInterval(getLightSensorReading, 2000);
};

var PORT = 12345;
var HOST = '192.168.7.2';

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
        const db = client.db(dbName);
        const collection = db.collection("availability");
        // update
		// const documents = await collection.updateOne({beaglebone: 3}, {$set: {isAvailable: toSet}}); // teg
        const documents = await collection.updateOne({beaglebone: 2}, {$set: {isAvailable: toSet}});
        console.log(documents);
    } catch (e) {
		console.log(e);
	} 
}

async function updateDB2(toSet){
	try {
        const db = client.db(dbName);
        const collection = db.collection("availability");
        // update
		// const documents = await collection.updateOne({beaglebone: 3}, {$set: {lightOn: toSet}}); // teg
        const documents = await collection.updateOne({beaglebone: 2}, {$set: {lightOn: toSet}}); 
        
        console.log(documents);
    } catch (e) {
		console.log(e);
	}
}

async function connectToDB() {
	await client.connect();
	console.log('Connected to MongoDB');
}

