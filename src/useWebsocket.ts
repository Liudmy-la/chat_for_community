import WebSocket from "ws";
import { Request} from "express";

import connect from './db/dbConnect';
import { eq } from 'drizzle-orm';
import { chatSchema } from './db/schema/chats';
import {newUserSchema} from './db/schema/users';
import {newParticipantSchema} from './db/schema/participant_junction';

export interface WebSocketClient {
	send: (data: WebSocket.Data) => void;
	readyState: number;
}

// export interface ChatData {
// 	permission: string | null;
// 	welcome: string;
// 	participants: Array<WebSocket> | undefined;
// 	messStorage: Array<any> | null;
// }

//-----------------------------------------------

async function chatExistsInDB (chatId: number) {
	const db = await connect()
	const existingChat = await db
		.select()
		.from(chatSchema)
		.where(eq(chatSchema.chat_id, chatId))
		.execute()
	
	return !!existingChat
}

async function checkInDB (ws: WebSocket) {
	const db = await connect()
	const wsJson = JSON.stringify(ws);
	const chatConsist = await db
		.select()
		.from(newUserSchema)
		.where(eq(newUserSchema.websocket, wsJson))
		.execute()
	
	return !!chatConsist
}

async function updateToDB (ws: WebSocket, chatId: number) {
	const db = await connect();
	const wsJson = JSON.stringify(ws);
	
	await db
		.update(newUserSchema)
		.set({websocket: wsJson})
		.where(eq(newUserSchema.user_id, chatId))
		.execute();
}

async function getList (chatId: number) {
	const db = await connect()
	const participantsList = await db
		.select()
		.from(newParticipantSchema)
		.where(eq(chatSchema.chat_id, chatId))
		.execute()
	
	return participantsList
}

async function memberDelete (ws: WebSocket) {
	const db = await connect();
	const wsJson = JSON.stringify(ws);
	
	await db
		.delete(newParticipantSchema)
		.where(eq(newUserSchema.websocket, wsJson))
		.execute();
}
//-----------------------------------------------

export const allChats: Map<string, ChatData> = new Map();
export let wsTimeSpamp: any;

const wsServer = new WebSocket.Server({ noServer: true });

wsServer.on("connection", (ws: WebSocket, req: Request) => {
	const url = req.url;
	wsTimeSpamp = new Date();

	// let chatName: string;
	let chat_id: number;
	// let chatData: ChatData | undefined;

	if (url.startsWith('/group-chat-')) {
		chat_id = Number(url.substring(12));

		const chatExists = chatExistsInDB(chat_id);
        if (!chatExists) {
			throw new Error (`This chat doesn't exists`)
		}

		const chatConsist = checkInDB(ws);
		if (!chatConsist) {
			updateToDB(ws, chat_id)
		}

		ws.send(JSON.stringify({ text: `Welcome! << ${chat_id} >> ` }));
	}

		// chatName = url.substring(12);
		// if (!allChats.get(chatName)) {
		// 	allChats.set(chatName, {
		// 		permission: '',
		// 		welcome: 'Hi there!',
   		// 		participants: [],
		// 		messStorage: [],
		// 	});
		// }

		// chatData = allChats.get(chatName);
		// if (chatData && chatData.participants && !chatData.participants.includes(ws)) {
		// 	chatData.participants.push(ws);
		// 	allChats.set(chatName, chatData);

		// 	ws.send(JSON.stringify({ text: `${chatData.welcome} We all are in << ${chatName} >> ` }));
		// }
	// } else if (url.startsWith('/priv-chat-')) {
	// 	chatName = url.substring(11);
	// 	if (!allChats.get(chatName)) {
	// 		allChats.set(chatName, {
	// 			permission: '',
	// 			welcome: 'Hello!',
	// 			participants: [],
	// 			messStorage: [],
	// 		});
	// 	}

	// 	chatData = allChats.get(chatName);
	// 	if (chatData && chatData.participants && !chatData.participants.includes(ws)) {
	// 		chatData.participants.push(ws);
	// 		allChats.set(chatName, chatData);

	// 		ws.send(JSON.stringify({ text: `${chatData.welcome} We are << ${chatName} >> ` }));
	// 	}
	

	ws.on('message', function (msg: string) {
		const receivedObj = JSON.parse(msg);
		updateToDB(ws, chat_id)
		// if (chatData && chatData.messStorage) {
		// 	chatData.messStorage.push(JSON.stringify(receivedObj));
		// }

		const participants = getList(chat_id)
		participants.forEach((client: WebSocketClient) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(JSON.stringify(receivedObj));
					}
			 	});
		// if (chatData && chatData.participants) {
		// 	 chatData.participants.forEach((client: WebSocketClient) => {
		// 		if (client.readyState === WebSocket.OPEN) {
		// 			client.send(JSON.stringify(receivedObj));
		// 		}
 		// 	});
		// }
	});

	ws.on('close', (code, reason) => {
		memberDelete (ws)
		// if (chatData && chatData.participants) {
		// 	chatData.participants = chatData.participants.filter((member) => member !== ws);
		// 	allChats.set(chatName, chatData);
		// }
	});
});

export default wsServer