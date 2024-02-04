import WebSocket from "ws";
import { Request } from "express";

export interface WebSocketClient {
	send: (data: WebSocket.Data) => void;
	readyState: number;
}

export interface ChatData {
	permission: string | null;
	welcome: string;
	participants: Array<WebSocket> | undefined;
	messStorage: Array<any>;
}

export const allChats: Map<string, ChatData> = new Map();
export let wsTimeSpamp: any;

function checkAuth() {
	// ?
	return true
}

const wsServer = new WebSocket.Server({ noServer: true });

wsServer.on("connection", (ws: WebSocket, req: Request) => {
	const url = req.url;
	const isConfirmed = checkAuth();
	wsTimeSpamp = new Date();

	let chatName: string;
	let chatData: ChatData | undefined;

	if (url.startsWith('/chat-of-')) {
		chatName = url.substring(9);
		if (!allChats.get(chatName)) {
			allChats.set(chatName, {
				permission: '',
				welcome: 'Hi there!',
   				participants: [],
				messStorage: [],
			});
		}

		chatData = allChats.get(chatName);
		if (chatData && chatData.participants && !chatData.participants.includes(ws)) {
			chatData.participants.push(ws);
			allChats.set(chatName, chatData);

			ws.send(JSON.stringify({ text: `${chatData.welcome} We all are in << ${chatName} >> ` }));
		}
	} else if (url.startsWith('/priv-chat-of-') && isConfirmed) {
		chatName = url.substring(14);
		if (!allChats.get(chatName)) {
			allChats.set(chatName, {
				permission: '',
				welcome: 'Hello!',
				participants: [],
				messStorage: [],
			});
		}

		chatData = allChats.get(chatName);
		if (chatData && chatData.participants && !chatData.participants.includes(ws)) {
			chatData.participants.push(ws);
			allChats.set(chatName, chatData);

			ws.send(JSON.stringify({ text: `${chatData.welcome} We are << ${chatName} >> ` }));
		}
	}

	ws.on('message', function (msg: string) {
		const receivedObj = JSON.parse(msg);
		if (chatData && chatData.messStorage) {
			chatData.messStorage.push(JSON.stringify(receivedObj));
		}

		if (chatData && chatData.participants) {
			 chatData.participants.forEach((client: WebSocketClient) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(receivedObj));
				}
 			});
		}
	});

	ws.on('close', (code, reason) => {
		if (chatData && chatData.participants) {
			chatData.participants = chatData.participants.filter((member) => member !== ws);
			allChats.set(chatName, chatData);
		}
	});
});

export default wsServer