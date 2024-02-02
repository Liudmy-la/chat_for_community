const wsPort = 7001 // port from backend: index.ts
const id = 'chronotope' // id & isPrivate - from backend: controllers (groupChat || privateChat)
	// const id = Math.floor(Math.random() * 1000) // to test getList 
const isPrivate = true

let url = `ws://localhost:${wsPort}/chat-of-${id}`
if (isPrivate) {
	url = `ws://localhost:${wsPort}/priv-chat-of-${id}`
}

const mywsServer = new WebSocket(url) // npm install ws --save

const myMessages = document.querySelector("#messages");
const myInput = document.querySelector("#message");
const myChats = document.querySelector("#chats");

const sendBtn = document.querySelector("#send");
const closeBtn = document.querySelector("#close");
const listBtn = document.querySelector("#chat-list");

sendBtn.disabled = true
closeBtn.disabled = true

async function getList () {
	const res = await fetch('/chat-list', {method: 'GET'})
    const {data} = await res.json();

	if (res.ok) {
    	showList(data);
	} else {
		const newRes = document.createElement("h4");
		newRes.style.color = 'red';
		newRes.innerText = data.message;
		myChats.appendChild(newRes);
	}
}

function showList (data) {
	myChats.innerHTML = '';	

	for (let ch of data) {
		const newChat = document.createElement("h5");
		newChat.style.color = 'blue';
		newChat.innerText = ch;
		myChats.appendChild(newChat);
	}
}

function msgGeneration(msg, from) {
	const newMessage = document.createElement("h5")
	if (msg.nic && msg.text && msg.timeStamp) {
		newMessage.innerText = `[Data from ${from}] : ${msg.nic} said << ${msg.text} >> on ${msg.timeStamp}`;
	} else {
		newMessage.innerText = `${msg.text}`
	}

	if (from === 'Server-side') {
		newMessage.style.color = 'green'

		if (myMessages.childElementCount === 0) {
			newMessage.style.color = 'purple'
		}
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

function toExit() {
	mywsServer.close()
	sendBtn.disabled = true
	closeBtn.disabled = true
	
	console.log(`Connection is crushed down ... `)
}

sendBtn.addEventListener("click", sendMsg, false)
closeBtn.addEventListener("click", toExit, false)
listBtn.addEventListener("click", getList, false)

mywsServer.onopen = function() {
	sendBtn.disabled = false
	closeBtn.disabled = false
}

mywsServer.onmessage = function(event) {
	const receivedObj = JSON.parse(event.data);
	msgGeneration(receivedObj, "Server-side")  // when everyone already got your smth

	console.log('Received Obj:', receivedObj.text)
}

