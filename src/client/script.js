const port = 7001; // process.env.PORT 

// let chat_id = '888';
let chat_id = Math.floor(Math.random() * 1000); // test getList 
let is_private = false;

//-----------------------------------------------

function checkAuth() {
	// ... ... ?
	return true
}

function getWebSocketURL() {
	const baseUrl = is_private ? `priv-chat-${chat_id}` : `group-chat-${chat_id}`;
	return `ws://localhost:${port}/${baseUrl}`;
}

function createWebSocket() {	
	const url = getWebSocketURL();

	const isAuth = checkAuth(); // if use 'async' -> change isAuth
	if (!isAuth) return null; // console.log(isAuth) 
    	
	return new WebSocket(url);
}
//-----------------------------------------------

const myMessages = document.querySelector("#messages");
const myInput = document.querySelector("#message");
const myChats = document.querySelector("#chats");
const chatTitle = document.querySelector("#chat-title");
	chatTitle.innerText = `Messages of ${chat_id} Chat`

const listBtn = document.querySelector("#chat-list");
const sendBtn = document.querySelector("#send");
const closeBtn = document.querySelector("#close");
const storageBtn = document.querySelector("#storage");

sendBtn.disabled = true;
closeBtn.disabled = true;
storageBtn.disabled = true;

//-----------------------------------------------

function setWebSocket() {
    const mywsServer = createWebSocket();

	if (mywsServer === null) {	
		if (confirm(`Login\n and Try again.`)) {
				document.location.assign(`http://localhost:7001/login`);
			} else {
				document.location.assign(`http://localhost:7001/`);
			}; 
		return;
	}

    mywsServer.onopen = function() {
        sendBtn.disabled = false;
        closeBtn.disabled = false;
        storageBtn.disabled = false;
    };

    mywsServer.onmessage = function(event) {
        const receivedObj = JSON.parse(event.data);		
		// when everyone already got your smth
        msgGeneration(receivedObj, "Server-side");
    };

	return mywsServer;
}

function changeWS(server, chatId, isPrivate) {
	server.close();
	myMessages.innerHTML = '';
	chat_id = chatId;
	is_private = isPrivate;

	mywsServer = setWebSocket();
	chatTitle.innerText = `Messages of ${chat_id} Chat`;
		console.log(`In the chat ${chat_id} !`);
	
	return mywsServer;
}

function exitWebSocket(server) {
	if (confirm(`Are you sure you want to close this chat?`)) {
		server.close();
		sendBtn.disabled = true;
		closeBtn.disabled = true;

		document.location.assign(`http://localhost:7001/allCroups`);
	} else return
}

async function getData () {
	const res = await fetch(`/chat-list?id=${chat_id}`, {
		method: 'GET',
		api_key: 'CLOUD_API_KEY', //process.env.CLOUD_API_KEY * userController
	});
	
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

async function showList () {	
	const data = await getData();

	myChats.innerHTML = '';	

	for (let ch of data.chats) {
		const newChat = document.createElement("button");
		newChat.style.color = 'blue';
		newChat.innerHTML= ch;
			const isPrivate = false; // from DB
		newChat.id = isPrivate ? 'private' : 'group'

		myChats.appendChild(newChat);

		newChat.addEventListener("click", () => changeWS(mywsServer, ch, isPrivate));
	}
}

async function showMessages (id) {
	const data = await getData(id);

	if (document.querySelector("#prevMess")) {
		prevMess.innerHTML = '' 
	} else {
		const prevMess = document.createElement("div");
		prevMess.id = 'prevMess';
		myMessages.prepend(prevMess);
	}

	const parsedMessages = data.messOfChatName.map(item => JSON.parse(item));

	parsedMessages.forEach(parsedItem => {
        const mess = document.createElement("h5");
        mess.style.color = 'grey';
        mess.innerText = `${parsedItem.nic} said << ${parsedItem.text} >> on ${parsedItem.timeStamp}`;
        prevMess.appendChild(mess);
    });
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

function sendMessage(server) {
	const obj = {
		text: myInput.value,
		nic: window.navigator.appName,
		timeStamp: (new Date()).toUTCString() 
	}; 
	msgGeneration(obj, "Client-side");
	server.send(JSON.stringify(obj));
}
// Event listeners
sendBtn.addEventListener("click", () => sendMessage(mywsServer));
closeBtn.addEventListener("click", () => exitWebSocket(mywsServer));
listBtn.addEventListener("click", () => showList());
storageBtn.addEventListener("click", () => showMessages(chat_id));

// NEW WebSocket connection
let mywsServer = setWebSocket()