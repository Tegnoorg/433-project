// I am client.js
var net = require('net');

var server_ip = '192.168.0.212';      // here enter your BBB-server IP address
var client = net.connect(8124, server_ip, function() {
  console.log('connected to server!');
  client.write('Hello from BBB client');
});

client.on('data', function(data) {
  console.log(data.toString());
  client.end();
});

client.on('end', function() {
  console.log('disconnected from server');
});