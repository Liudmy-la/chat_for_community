 // take 'port' from backend: index.ts
const wsPort = 7001

// take 'id' & 'i'sPrivate'  from backend: controllers -- groupChat
const isPrivate = false;
// const id = 'chronotope';
let chat_id = Math.floor(Math.random() * 1000) // test getList 

let url;
if (!isPrivate) {
	url = `ws://localhost:${wsPort}/chat-of-${chat_id}`
}
if (isPrivate && checkAuth) {
		url = `ws://localhost:${wsPort}/priv-chat-of-${chat_id}`
}

//-----------------------------------------------

let mywsServer = new WebSocket(url); // npm install ws --save

const myMessages = document.querySelector("#messages");
const myInput = document.querySelector("#message");
const myChats = document.querySelector("#chats");
const chatTitle = document.querySelector("#chat-title");

const listBtn = document.querySelector("#chat-list");
const sendBtn = document.querySelector("#send");
const closeBtn = document.querySelector("#close");
const storageBtn = document.querySelector("#storage");
const toTheChat = document.querySelector("#anotherChat");

sendBtn.disabled = true;
closeBtn.disabled = true;
storageBtn.disabled = true;

chatTitle.innerText = `Messages of ${chat_id} Chat`

//-----------------------------------------------

async function getData () {
	const res = await fetch(`/chat-list?id=${chat_id}`, {method: 'GET'});
	
	if (res.ok) {
        const { data } = await res.json();
		return data
	} else {
		const newRes = document.createElement("h4");
		newRes.style.color = 'red';
		newRes.innerText = data.message;
		myChats.appendChild(newRes);
	}
}

async function checkAuth() {
	// ?	
	
	return true
}

async function showList () {	
	const data = await getData();

	myChats.innerHTML = '';	

	for (let ch of data.chats) {
		const newChat = document.createElement("button");
		newChat.style.color = 'blue';
		newChat.innerHTML= ch;
		newChat.id = `anotherChat`;

		myChats.appendChild(newChat);

		newChat.addEventListener("click", () => changeWS(mywsServer, ch));
	}
}

function changeWS (server, chat) {	
	server.close();
	myMessages.innerHTML = '';

	const newServer = new WebSocket(`ws://localhost:${wsPort}/chat-of-${chat}`);
	mywsServer = newServer;
	chat_id = chat;
	chatTitle.innerText = `Messages of ${chat_id} Chat`;

		console.log(`In the chat ${chat} !`);

	// showMessages()
}

async function showMessages () {
	const data = await getData();

	const prevMess = document.createElement("div");
	myMessages.prepend(prevMess)

	for (let item of data.messOfChatName) {
		const mess = document.createElement("h5")
		mess.style.color = 'grey'
		mess.innerText =  `${JSON.parse(item).nic} said << ${JSON.parse(item).text} >> on ${JSON.parse(item).timeStamp}`;
		prevMess.appendChild(mess);
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
	msgGeneration(obj, "Client-side"); // when you send smth
	mywsServer.send(JSON.stringify(obj));
}

function toExit() {
	mywsServer.close()

	sendBtn.disabled = true
	closeBtn.disabled = true	
		console.log(`Connection is crushed down ... `)
}

sendBtn.addEventListener("click", sendMsg);
closeBtn.addEventListener("click", toExit);
listBtn.addEventListener("click", showList);
storageBtn.addEventListener("click", showMessages);

mywsServer.onopen = function() {
	sendBtn.disabled = false;
	closeBtn.disabled = false;
	storageBtn.disabled = false;
}

mywsServer.onmessage = function(event) {
	const receivedObj = JSON.parse(event.data);
	// when everyone already got your smth
	msgGeneration(receivedObj, "Server-side");
}