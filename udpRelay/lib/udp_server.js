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
	connectToDB();
	io = socketio.listen(server);
	io.set('log level 1');

	io.sockets.on('connection', function(socket) {
		setInterval(getDistance2, 2000);
		setInterval(getDistance3, 2000);
		setInterval(updateMotionReading, 2000, socket);
	});

};

// Info for connecting to the local process via UDP
var PORT = 12345;
var HOST = '192.168.7.2';

var lastDistance2 = '-1'
function getDistance2() {
	var client = dgram.createSocket('udp4');
	var buffer = "distance2";
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
		let newDistance = message.toString('utf-8');
		if (lastDistance2 !== newDistance) {
			lastDistance2 = newDistance;
			//update db
			updateDB2(newDistance);
			console.log('update db2');
		}

		client.close();

	});
}

var lastDistance3 = '-1'
function getDistance3() {
	var client = dgram.createSocket('udp4');
	var buffer = "distance3";
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
		let newDistance = message.toString('utf-8');
		if (lastDistance3 !== newDistance) {
			lastDistance3 = newDistance;
			//update db
			updateDB(newDistance);
			console.log('update db');
		}

		client.close();

	});
}

function updateMotionReading(socket) {
	var client = dgram.createSocket('udp4');

	client.on('listening', function () {
		var address = client.address();
	});
	getDB(socket);
	client.on('message', function (message, remote) {
		client.close();
	});
}

async function getDB(socket){
	try {
        const db = client.db(dbName);
        const collection = db.collection("availability");
        // update
        const documents = await collection.find({}).toArray();
        var motionDetected = documents[0].isAvailable;
		var reply = "motion2 ";
		if (motionDetected == '1') {
			reply += 'Yes'
		} else {
			reply += 'No'
		}
		socket.emit('commandReply', reply);
		var light2Detected = documents[0].lightOn;
		var reply = "light2 ";
		if (light2Detected == '1') {
			reply += 'Yes'
		} else {
			reply += 'No'
		}
		socket.emit('commandReply', reply);
		if (motionDetected == '1' || light2Detected == '0') {
			socket.emit('commandReply', 'washroom2 No');
		} else {
			socket.emit('commandReply', 'washroom2 Yes');
		}
		var forceDetected = documents[1].isAvailable;
		var reply = "force1 ";
		if (forceDetected == '1') {
			reply += 'Yes'
		} else {
			reply += 'No'
		}
		socket.emit('commandReply', reply);
		var light1Detected = documents[1].lightOn;
		var reply = "light1 ";
		if (light1Detected == '1') {
			reply += 'Yes'
		} else {
			reply += 'No'
		}
		socket.emit('commandReply', reply);
		if (forceDetected == '1' || light1Detected == '0') {
			socket.emit('commandReply', 'washroom1 No');
		} else {
			socket.emit('commandReply', 'washroom1 Yes');
		}
		var distance2 = documents[1].distance;
		var reply = "distance2 ";
		reply += distance2;
		socket.emit('commandReply', reply);
		var distance3 = documents[0].distance;
		var reply = "distance3 ";
		reply += distance3;
		socket.emit('commandReply', reply);
    } catch (e) {
		console.log(e);
		socket.emit('commandReply', 'error');
	}
}

async function updateDB(toSet){
	try {
        const db = client.db(dbName);
        const collection = db.collection("availability");
        // update
        const documents = await collection.updateOne({beaglebone: 3}, {$set: {distance: toSet}});
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
        const documents = await collection.updateOne({beaglebone: 2}, {$set: {distance: toSet}}); 
        console.log(documents);
    } catch (e) {
		console.log(e);
	} 
}

async function connectToDB() {
	await client.connect();
	console.log('Connected to MongoDB');
}