const port = 7001; // process.env.PORT 

// const id = 'chronotope'; // take 'id' from backend: controllers -- groupChat
let chat_id = Math.floor(Math.random() * 1000); // test getList 
const isPrivate = false;

function getWebSocketURL(chatId, isPrivate) {
	const baseUrl = isPrivate ? `priv-chat-${chatId}` : `group-chat-${chatId}`;
	return `ws://localhost:${port}/${baseUrl}`;
}

// npm install ws --save
function createWebSocket(chatId, isPrivate) {
	let url
	checkAuth()
		? url = getWebSocketURL(chatId, isPrivate)
		: document.alert(`Login and Try again.`)
	
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

// Initialize WebSocket connection
function initializeWebSocket(chatId, isPrivate) {
    const mywsServer = createWebSocket(chatId, isPrivate);

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

// Change WebSocket
function changeWS(server, chatId, isPrivate) {
    server.close();
    myMessages.innerHTML = '';

    const mywsServer = createWebSocket(chatId, isPrivate);
    chatTitle.innerText = `Messages of ${chatId} Chat`;
    console.log(`In the chat ${chatId} !`);

	chat_id = chatId

    return mywsServer;
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

function exitWebSocket(server) {
    server.close();
    sendBtn.disabled = true;
    closeBtn.disabled = true;
    console.log(`Connection is closed.`);
}

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
	// const token = getToken(); // need functions to get the data from wherever it's stored
    // const email = getEmail(); 
    // const chat_id = getChatId(); 

    // const response = await fetch('/auth', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ token, email, chat_id })
    // });

    // const data = await response.json();
    // return data.isAuthenticated;
	// 
	return true
}

async function showList () {	
	const data = await getData();

	myChats.innerHTML = '';	

	for (let ch of data.chats) {
		const newChat = document.createElement("button");
		newChat.style.color = 'blue';
		newChat.innerHTML= ch;
		const isPrivate = false;
		newChat.id = isPrivate ? 'private' : 'group'

		myChats.appendChild(newChat);

		newChat.addEventListener("click", () => changeWS(mywsServer, ch, isPrivate));
	}
}

async function showMessages (id) {
	const data = await getData(id);

	const prevMess = document.createElement("div");
	myMessages.prepend(prevMess);

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

// Initialize NEW WebSocket connection
let mywsServer = initializeWebSocket(chat_id, isPrivate);
// Event listeners
sendBtn.addEventListener("click", () => sendMessage(mywsServer));
closeBtn.addEventListener("click", () => exitWebSocket(mywsServer));
listBtn.addEventListener("click", () => showList());
storageBtn.addEventListener("click", () => showMessages(chat_id));
