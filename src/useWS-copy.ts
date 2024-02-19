import WebSocket, { Data } from "ws";
import { Request} from "express";

import connect from './db/dbConnect';
import { eq } from 'drizzle-orm';
import { chatSchema } from './db/schema/chats';
import {newUserSchema} from './db/schema/users';
import {newMessageSchema} from './db/schema/messages';
import {newParticipantSchema} from './db/schema/participant_junction';

export interface WebSocketClient {
	send: (data: WebSocket.Data) => void;
	readyState: number;
}

//-----------------------------------------------

async function chatExists (chatId: number) {
	const db = await connect();

	const existingChat = await db
		.select()
		.from(chatSchema)
		.where(eq(chatSchema.chat_id, chatId))
		.execute();
	
	return !!existingChat;
}

async function defineUser (email: string,) {
	const db = await connect();

	const user = await db
    .select()
    .from(newUserSchema)
    .where(eq(newUserSchema.email, email))
    .execute();

	return user;
}

async function checkInDB (userId: number, chatId: number) {
	const db = await connect();

	const chatConsist = await db
		.select()
		.from(newParticipantSchema)
		.where(eq(newParticipantSchema.user_id, userId))
		.where(eq(newParticipantSchema.chat_id, chatId))
		.execute();
	
	return !!chatConsist;
}

async function updateTime (userId: number, chatId: number, timeStamt: string) {
	const db = await connect();

	await db
	.update(newParticipantSchema)
	.set({connected_at: timeStamt})
	.where(eq(newParticipantSchema.user_id, userId))
	.where(eq(newParticipantSchema.chat_id, chatId))
	.execute();

}

async function insertToDB (
		option: string, 
		userId: number, 
		chatId: number, 
		timeStamp: string,
		ws: WebSocket | null,
		msg: string | null
	) {
	const db = await connect();

	switch (option) {
		case 'participant':	
			await db
				.insert(newParticipantSchema)
				.values({chat_id: chatId, user_id: userId, connected_at: timeStamp, websocket: ws})
				.execute();
		case 'message':	
			await db
				.insert(newMessageSchema)
				.values({chat_id: chatId, user_id: userId, timestamp: timeStamp, message_text: msg})
				.execute();
	}
}

async function getList (chatId: number) {
	const db = await connect()
	const participantsList = await db
		.select()
		.from(newParticipantSchema)
		.where(eq(newParticipantSchema.chat_id, chatId))
		.execute()
	
		const websocketsArray: any[] = participantsList.map(participant => participant.websocket);

	return websocketsArray
}
//-----------------------------------------------

const wsServer = new WebSocket.Server({ noServer: true });

wsServer.on("connection", async(ws: WebSocket, req: Request) => {
	const url = req.url;

	const user_email: string = url.substring(url.indexOf('user-') + 5);

	const searchUser = await defineUser(user_email);
	const user_id: number = searchUser[0].user_id;

	const connectTime: string = (new Date()).toUTCString();

	let chat_id: number;
	if (url.startsWith('/group-chat-')) {
		chat_id = Number(url.substring(12));

		const isChat = await chatExists(chat_id);
		if (!isChat) {
			throw new Error (`This chat doesn't exists`);
		}

		const chatConsist = await checkInDB(user_id, chat_id);
		if (chatConsist) {
			await updateTime(user_id, chat_id, connectTime);
		}
		else {
			await insertToDB('participant', user_id, chat_id, connectTime, ws, null);
		}

		ws.send(JSON.stringify({ text: `Welcome! << ${chat_id} >> ` }));
	} else if (url.startsWith('/priv-chat-')) {
		chat_id = Number(url.substring(11));

		const isChat = await chatExists(chat_id);
		if (!isChat) {
			throw new Error (`This chat doesn't exists`);
		}

		const chatConsist = await checkInDB(user_id, chat_id);		
		if (chatConsist) {
			await updateTime(user_id, chat_id, connectTime);
		}

		ws.send(JSON.stringify({ text: `Hello! << ${chat_id} >> ` }));
	}	

	ws.on('message', async (msg: string) => {
		const receivedObj = JSON.parse(msg);
		const newTime: string = receivedObj.timeStamp;
		const newMsg: string = receivedObj.text;

		const objToSend = {
				text: newMsg,
				nic: user_id,
				timeStamp: newTime
			};

		await insertToDB('message', user_id, chat_id, newTime, null, newMsg);

		const connectedWS = await getList(chat_id);
		const otherParticipants = connectedWS.filter((participant) => participant !== ws)
		otherParticipants.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(JSON.stringify(objToSend));
					}
			 	});

		ws.send(JSON.stringify({ text: `sent` }))
	});

	ws.on('close', (code, reason) => {
		// fix time of disconnection
		// Make user off-line - if connection closed, but user didn't leave the chat		
	});
});

export default wsServer