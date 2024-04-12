"use strict";
// Client-side interactions with the browser.

// Make connection to server when web page is fully loaded.
var socket = io.connect();
var beatboxErr = false;

$(document).ready(function() {

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
		$('#error-box').hide()
		beatboxErr = false;

		if (result.startsWith("motion2")) {
			var val = result.split(" ")[1];
			$('#motion-2').text(`Motion Detected: ${val}`)
		}
		else if (result.startsWith("light2")){
			var val = result.split(" ")[1];
			$('#light-2').text(`Light Detected: ${val}`)
		}
		else if (result.startsWith("force1")){
			var val = result.split(" ")[1];
			$('#force-1').text(`Force Detected: ${val}`)
		}
		else if (result.startsWith("light1")){
			var val = result.split(" ")[1];
			$('#light-1').text(`Light Detected: ${val}`)
		} else if (result.startsWith("washroom1")) {
			var val = result.split(" ")[1];
			if (val == 'No') {
				$('#available-1').html(`Available: <span style="color: red">${val}</span>`)
			} else {
				$('#available-1').html(`Available: <span style="color: green">${val}</span>`)
			}
		} else if (result.startsWith("washroom2")) {
			var val = result.split(" ")[1];
			if (val == 'No') {
				$('#available-2').html(`Available: <span style="color: red">${val}</span>`)
			} else {
				$('#available-2').html(`Available: <span style="color: green">${val}</span>`)
			}
		} else if (result.startsWith("error")) {
			$('#error-box').show()
			$('#error-text').text("Database error")
			beatboxErr = true;
		}
	});

	// setInterval(serverStatus, 1000);
});

function sendCommandViaUDP(message) {
	socket.emit('daUdpCommand', message);
};

function serverStatus() {
	fetch('http://192.168.7.2:8088/')
		.then(response => {
			if (!response.ok) {
				throw new Error('Server is not responding');
				
			} else if(!beatboxErr){
				$('#error-box').hide()
			}
		})
		.catch(error => {
			$('#error-box').show()
			$('#error-text').text("No response from the Node.js server")
		});
}

