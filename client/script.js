// import { getChatsData, getMessageData } from "../api";

async function getChatsData (chatId) {
	try {
		const res = await fetch(`/chat-list?id=${chatId}`, {
			method: 'GET',
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
	} catch (error) {
		console.error(`Error getData : ${error.message}`);
	}
}

async function getMessageData (chatId) {
	try {
		const res = await fetch(`/chat-online?id=${chatId}`, {
			method: 'GET',
		});
		
		if (res.ok) {
			const { data } = await res.json();
			return data.messOfChatName
		} else {
			const newRes = document.createElement("h4");
			newRes.style.color = 'red';
			newRes.innerText = data.message;
			myChats.appendChild(newRes);
		}
	} catch (error) {
		console.error(`Error getData : ${error.message}`);
	}
}
//-----------------------------------------------

const port = 'localhost:7001'; // process.env.PORT

let chat_id = '102'; //from backend
let is_private = false; //from backend
//-----------------------------------------------

async function checkAuth() {
	// ... ... ...
	return true
}

const user_email = 'example@box'; // result of authenticateUser
//-----------------------------------------------

function getWebSocketURL() {
	const baseUrl = is_private ? `priv-chat-${chat_id}` : `group-chat-${chat_id}`;
	return `ws://${port}/${baseUrl}/user-${user_email}`;
}

async function createWebSocket() {	
	const url = getWebSocketURL();

	const isAuth = await checkAuth();
	if (!isAuth) return null;
    	
	return new WebSocket(url);
}
//-----------------------------------------------

const myMessages = document.querySelector("#messages");
const myInput = document.querySelector("#message");
const myChats = document.querySelector("#chats");
const chatTitle = document.querySelector("#chat-title");
	chatTitle.innerText = `Messages of << ${chat_id} >> Chat`

const groupListBtn = document.querySelector("#group-list");
const privListBtn = document.querySelector("#priv-list");
const fullListBtn = document.querySelector("#full-list");

const sendBtn = document.querySelector("#send");
const closeBtn = document.querySelector("#close");
const storageBtn = document.querySelector("#storage");

sendBtn.disabled = true;
closeBtn.disabled = true;
storageBtn.disabled = true;

//-----------------------------------------------

async function setWebSocket() {
    const mywsServer = await createWebSocket();

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
		
        sendBtn.addEventListener("click", () => sendMessage(mywsServer));
    };

    mywsServer.onmessage = function(event) {
        const receivedObj = JSON.parse(event.data);		
		// when everyone already got your smth
        msgGeneration(receivedObj, "Income msg");
    };

	return mywsServer;
}

async function changeWS(server, chatId, isPrivate) {
	if (server instanceof WebSocket) {
		server.close();
	}
	
	myMessages.innerHTML = '';
	chat_id = chatId;
	is_private = isPrivate;

	mywsServer = await setWebSocket();
	chatTitle.innerText = `Messages of ${chat_id} Chat`;
	
	return mywsServer;
}

function exitWebSocket(server) {
	if (confirm(`Are you sure you want to close this chat?`)) {
		server.close();
		sendBtn.disabled = true;
		closeBtn.disabled = true;

		document.location.assign(`http://localhost:7001/allGroups`);
	} else return
}

async function joinedChats (privData) {	
	try {
		const data = await getChatsData(chat_id);

		myChats.innerHTML = '';	

		const chatArray = privData ? data.privChats : data.groupChats;

		for (let ch of chatArray) {
			const newChat = document.createElement("button");
			newChat.style.color = privData ? 'orange' : 'blue';
			newChat.innerHTML= ch.name;
			newChat.id = privData ? 'private' : 'group'

			myChats.appendChild(newChat);

			newChat.addEventListener("click", () => changeWS(mywsServer, ch.id, privData));
		}
	} catch (error) {
		console.error(`Error joinedChats : ${error.message}`);
	}
}

async function showFullList() {	
	try {
		const data = await getChatsData(chat_id);

		myChats.innerHTML = '';	

		for (let ch of data.commonChats) {
			const newChat = document.createElement("button");
			newChat.style.color = 'green';
			newChat.innerHTML= ch.name;
			newChat.id = 'group'

			myChats.appendChild(newChat);

			newChat.addEventListener("click", () => changeWS(mywsServer, ch.id, false));
		}
	} catch (error) {
		console.error(`Error showFullList : ${error.message}`);
	}
}

async function showMessages () {
	try {
		const data = await getMessageData(chat_id); //only last 8 Messages

		if (document.querySelector("#prevMess")) {
			prevMess.innerHTML = '' 
		} else {
			const prevMess = document.createElement("div");
			prevMess.id = 'prevMess';
			myMessages.prepend(prevMess);
		}

		if (data.length === 0) {
			const mess = document.createElement("h5");
			mess.style.color = 'purple';
			mess.innerText = `No messages. Start the conversation here`;
			prevMess.appendChild(mess);
		}

		data.forEach(parsedItem => {
			const mess = document.createElement("h5");
			mess.style.color = 'grey';
			mess.innerText = `${parsedItem.sender} said << ${parsedItem.text} >> on ${parsedItem.timeStamp}`;
			prevMess.prepend(mess);
		});
	} catch (error) {
		console.error(`Error showMessages : ${error.message}`);
	}
}

function msgGeneration(msg, action) {
	const newMessage = document.createElement("h5")
	if (msg.nic && msg.text && msg.timeStamp) {
		newMessage.innerText = `[ ${action}] : ${msg.nic} said << ${msg.text} >> on ${msg.timeStamp.toUTCString()}`;
	} else {		
		newMessage.innerText = `<< ${msg.text} >> at ${msg.timeStamp.toUTCString()}`;
	}

	if (action === 'Income msg') {
		newMessage.style.color = 'green'

		if (myMessages.childElementCount === 0) {
			newMessage.style.color = 'purple'
		}
	}
	myMessages.appendChild(newMessage);
}

function sendMessage(server) {
	const obj = {
		text: myInput.value,
		nic: 'You',
		timeStamp: new Date() 
	}; 
	msgGeneration(obj, obj.nic);

	server.send(JSON.stringify(obj));
}
// Event listeners
// sendBtn.addEventListener("click", () => sendMessage(mywsServer));
closeBtn.addEventListener("click", () => exitWebSocket(mywsServer));
groupListBtn.addEventListener("click", () => joinedChats(false));
privListBtn.addEventListener("click", () => joinedChats(true));
fullListBtn.addEventListener("click", () => showFullList());
storageBtn.addEventListener("click", () => showMessages());

// NEW WebSocket connection
let mywsServer = setWebSocket();