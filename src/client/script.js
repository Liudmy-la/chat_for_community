const wsPort = 7001 // from backend

const url = `ws://localhost:${wsPort}/chatting`
 
const mywsServer = new WebSocket(url) // npm install ws --save

const myMessages = document.querySelector("#messages");
const myInput = document.querySelector("#message");
const sendBtn = document.querySelector("#send");

sendBtn.disabled = true

function msgGeneration(msg, from) {
		const newMessage = document.createElement("h5")
		newMessage.innerText = `[Data from ${from}] : ${msg.nic} said << ${msg.text} >> at ${msg.timeStamp}`;

		if (from === 'Server-side') {
			newMessage.style.color = 'green'
		}

		myMessages.appendChild(newMessage)
}

function sendMsg() {
	const obj = {
		text: myInput.value,
		nic: window.navigator.appName, // get the nic-name of user who types 
		timeStamp: (new Date()).toUTCString() 
	} 
	msgGeneration(obj, "Client-side") // when you send smth
	mywsServer.send(JSON.stringify(obj))

	console.log('Obj to Send: ', JSON.stringify(obj))
}

sendBtn.addEventListener("click", sendMsg, false)

mywsServer.onopen = function() {
	sendBtn.disabled = false
}

mywsServer.onmessage = function(event) {
	const receivedObj = JSON.parse(event.data);
	msgGeneration(receivedObj, "Server-side")  // when everyone already got your smth

	console.log('Received Obj:', receivedObj.text)
}

