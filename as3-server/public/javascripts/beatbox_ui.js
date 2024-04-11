"use strict";
// Client-side interactions with the browser.

// Make connection to server when web page is fully loaded.
var socket = io.connect();
var beatboxErr = false;
$(document).ready(function() {
	// window.setInterval(function() {
	// 	var errorTimer = setTimeout(function() {
	// 		var reply = "error beatboxNotRunning".toString('utf8')
	// 		socket.emit("commandReply", reply)
	// 	}, 1000)
	// }, 1000);
	// window.setInter
	
	// $('#error-box').hide()

	$('#volumeUp').click(function(){
		sendCommandViaUDP("volumeUp");
	});
	$('#volumeDown').click(function(){
		sendCommandViaUDP("volumeDown");
	});
	$('#tempoUp').click(function(){
		sendCommandViaUDP("tempoUp");
	});
	$('#tempoDown').click(function(){
		sendCommandViaUDP("tempoDown");
	});
	$('#modeNone').click(function(){
		sendCommandViaUDP("mode 0");
	});
	$('#modeRock1').click(function(){
		sendCommandViaUDP("mode 1");
	});
	$('#modeRock2').click(function(){
		sendCommandViaUDP("mode 2");
	});
	$('#stop').click(function(){
		sendCommandViaUDP("stop");
	});
	$('#play1').click(function(){
		sendCommandViaUDP("play 1");
	});
	$('#play2').click(function(){
		sendCommandViaUDP("play 2");
	});
	$('#play3').click(function(){
		sendCommandViaUDP("play 3");
	});

	socket.on('commandReply', function(result) {
		// clearTimeout(errorTimer);
		$('#error-box').hide()
		beatboxErr = false;
		if (result.startsWith("mode")) {
			var num = result.split(" ")[1];
			var mode = "None";
			if (num == 1) {
				mode = "Rock #1"
			} else if (num == 2) {
				mode = "Rock?"
			}
			$('#modeid').text(mode)
		}
		else if (result.startsWith("volume")){
			$('#volumeid').val(result.split(" ")[1])
		}
		else if (result.startsWith("tempo")){
			$('#tempoid').val(result.split(" ")[1])
		}
		else if (result.startsWith("uptime")){
			let temp = result.split(" ")[1]
			let seconds = Math.floor(temp % 60);
			let minutes = Math.floor((temp%3600)/60);
			let hour = Math.floor(temp/3600);
			var formattedSecs = ("0" + seconds).slice(-2);
			var formattedMins = ("0" + minutes).slice(-2);
			var formattedHrs = ("0" + hour).slice(-2);
			// console.log(seconds, minutes, hour)

			$('#status').text(`${formattedHrs}:${formattedMins}:${formattedSecs} (H:M:S)`)
		} else if (result.startsWith("error")) {
			// console.log("askjdfhalsdfhksahfaskfhiw8123941341");
			$('#error-box').show()
			$('#error-text').text("No reponse from beat-box application. Is it running?")
			beatboxErr = true;
		}
		
	});
	setInterval(serverStatus, 1000);
});

function sendCommandViaUDP(message) {
	socket.emit('daUdpCommand', message);
};


function serverStatus() {
	fetch('http://localhost:8088/')
		.then(response => {
			if (!response.ok) {
				throw new Error('Server is not responding');
				
			} else if(!beatboxErr){
				$('#error-box').hide()
			}
		})
		.catch(error => {
			console.error('Error checking server status:', error.message);

			$('#error-box').show()
			$('#error-text').text("No response from the Node.js server")
			// Handle the server shutdown here, e.g., display a message to the user
		});
}