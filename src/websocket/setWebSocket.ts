import { port } from "index";

export async function setWebSocket(chat_id: number, is_private: boolean, user_email: string) {
	const htmlElements = initElements();

    const myWS: WebSocket = await createWebSocket(chat_id, is_private, user_email);

	if (myWS === null) {	
		if (confirm(`Login\n and Try again.`)) {
				document.location.assign(`http://localhost:7001/login`);
			} else {
				document.location.assign(`http://localhost:7001/`);
			}; 
		return;
	}

    myWS.onopen = () => onOpenButtons (
			myWS, 
			htmlElements.sendBtn, 
			htmlElements.closeBtn , 
			htmlElements.storageBtn,
			htmlElements.myInput,
			htmlElements.myMessages
		);

	htmlElements.chatTitle && (htmlElements.chatTitle.innerText = `Messages of << ${chat_id} >> Chat`);

    myWS.onmessage = (event: MessageEvent) => onIncomeMessage (event, chat_id, myWS, htmlElements.myMessages);

	return myWS;
};

async function createWebSocket(chat_id: number, is_private: boolean, user_email: string) {	
	const url = getWebSocketURL(chat_id, is_private, user_email);
    	
	return new WebSocket(url);
};

function getWebSocketURL(chat_id: number, is_private: boolean, user_email: string) {
	const baseUrl = is_private ? `priv-chat-${chat_id}` : `group-chat-${chat_id}`;
	return `ws://${port}/${baseUrl}/user-${user_email}`;
};

function onOpenButtons (
	ws: WebSocket, 
	sendBtn: HTMLButtonElement, 
	closeBtn: HTMLButtonElement, 
	storageBtn: HTMLButtonElement,
	myInput: HTMLInputElement,
	myMessages: HTMLElement
) {	
	sendBtn && (sendBtn.disabled = false);
	closeBtn && (closeBtn.disabled = false);
	storageBtn && (storageBtn.disabled = false);
	
	sendBtn && sendBtn.addEventListener("click", () => sendMessage(ws, myInput, myMessages));
};

function onIncomeMessage (event: MessageEvent, chat_id: number, ws: WebSocket, messagesElement: HTMLElement) {
	const receivedObj = JSON.parse(event.data);		
	
	msgGeneration(receivedObj, "Income msg", messagesElement);
};

function sendMessage(ws: WebSocket, input: HTMLInputElement, messagesElement: HTMLElement) {
	const obj = {
		text: input.value,
		nic: 'You',
		timeStamp: new Date() 
	}; 
	msgGeneration(obj, obj.nic, messagesElement);

	ws.send(JSON.stringify(obj));
};

function msgGeneration(msg:{text: string, nic: string, timeStamp: Date} , action: string, messagesElement: HTMLElement) {
	const newMessage = document.createElement("h5")
	if (msg.nic && msg.text && msg.timeStamp) {
		newMessage.innerText = `[ ${action}] : ${msg.nic} said << ${msg.text} >> on ${msg.timeStamp.toUTCString()}`;
	} else {		
		newMessage.innerText = `<< ${msg.text} >> at ${msg.timeStamp.toUTCString()}`;
	}

	if (action === 'Income msg') {
		newMessage.style.color = 'green'

		if (messagesElement.childElementCount === 0) {
			newMessage.style.color = 'purple'
		}
	}
	messagesElement.appendChild(newMessage);
};

//----------------------------------

function initElements () {
	const myMessages = document.querySelector("#messages") as HTMLElement;
	const myInput = document.querySelector("#message") as HTMLInputElement;
	const myChats = document.querySelector("#chats") as HTMLElement;
	const chatTitle = document.querySelector("#chat-title") as HTMLElement;

	const groupListBtn = document.querySelector("#group-list") as HTMLButtonElement;
	const privListBtn = document.querySelector("#priv-list") as HTMLButtonElement;
	const fullListBtn = document.querySelector("#full-list") as HTMLButtonElement;

	const sendBtn = document.querySelector("#send") as HTMLButtonElement;
	const closeBtn = document.querySelector("#close") as HTMLButtonElement;
	const storageBtn = document.querySelector("#storage") as HTMLButtonElement;
		
		sendBtn.disabled = true;
		closeBtn.disabled = true;
		storageBtn.disabled = true;

	const htmlElements: {
		myMessages: HTMLElement,
		myInput: HTMLInputElement,
		myChats: HTMLElement,
		chatTitle: HTMLElement,
		groupListBtn: HTMLButtonElement,
		privListBtn: HTMLButtonElement,
		fullListBtn: HTMLButtonElement,
		sendBtn: HTMLButtonElement,
		closeBtn: HTMLButtonElement,
		storageBtn: HTMLButtonElement,
		} = {
			myMessages: myMessages,
			myInput: myInput,
			myChats: myChats,
			chatTitle: chatTitle,
			groupListBtn: groupListBtn,
			privListBtn: privListBtn,
			fullListBtn: fullListBtn,
			sendBtn: sendBtn,
			closeBtn: closeBtn,
			storageBtn: storageBtn,
		}

	return htmlElements;
}

//----------------------------------

export async function changeWS(ws: WebSocket, chatId: number, isPrivate: boolean, email: string) {
	if (ws instanceof WebSocket) {
		ws.close();
	}

	const htmlElements = initElements();	
	htmlElements.myMessages.innerHTML = '';

	const myWS = await setWebSocket(chatId, isPrivate, email);
	htmlElements.chatTitle.innerText = `Messages of ${chatId} Chat`;
	
	return myWS;
}

export function exitWebSocket(ws: WebSocket) {
	if (confirm(`Are you sure you want to close this chat?`)) {
		ws.close();

		const htmlElements = initElements();	

		htmlElements.sendBtn.disabled = true;
		htmlElements.closeBtn.disabled = true;

		document.location.assign(`http://localhost:7001/chat-list`);
	} else return
}