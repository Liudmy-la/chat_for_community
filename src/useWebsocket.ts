import WebSocket from "ws";
import { Request} from "express";

import {connect} from './db/dbConnect';
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

async function updateTime (userId: number, chatId: number, timeStamt: Date) {
	const db = await connect();

	const pair = await db
	.select()
	.from(newParticipantSchema)
	.where(eq(newParticipantSchema.user_id, userId))
	.where(eq(newParticipantSchema.chat_id, chatId))
	.execute();

	const pair_id = pair[0].participant_id

	await db
	.update(newParticipantSchema)
	.set({connected_at: timeStamt})
	.where(eq(newParticipantSchema.participant_id, pair_id))
	.execute();
}

async function insertParticipant (userId: number, chatId: number, timeStamp: Date, ws: WebSocket) {
	const db = await connect();
	await db
		.insert(newParticipantSchema)
		.values({chat_id: chatId, user_id: userId, connected_at: timeStamp, websocket: ws})
		.execute();
}

async function insertMessage (userId: number, chatId: number, timeStamp: Date, msg: string) {
	const db = await connect();
	await db
		.insert(newMessageSchema)
		.values({chat_id: chatId, user_id: userId, timestamp: timeStamp, message_text: msg})
		.execute();	
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

const onConnect = () => async (ws: WebSocket, req: Request) => {
	try {
		const url: string = req.url;

		const user_email: string = url.substring(url.indexOf('user-') + 5);

		const searchUser = await defineUser(user_email);
		const user_id: number = searchUser[0].user_id;

		useIncomeData(url, user_id, ws)

		ws.on('message', onMsg);

	} catch (error: any) {
		console.error(`Error onConnect : ${error.message}`);
	}
}

async function useIncomeData (url: string, user_id: number, ws: WebSocket) {	
	const connectTime: Date = new Date();

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
			await insertParticipant(user_id, chat_id, connectTime, ws);
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
}

const onMsg = (msg: string) => async (user_id: number, chat_id: number, ws: WebSocket, msg: string) => {	
	const receivedObj = JSON.parse(msg);
	const newTime: Date = receivedObj.timeStamp;
	const newMsg: string = receivedObj.text;

	const objToSend = {
			text: newMsg,
			nic: user_id,
			timeStamp: newTime
		};

	await insertMessage(user_id, chat_id, newTime, newMsg);

	const connectedWS = await getList(chat_id);
	const otherParticipants = connectedWS.filter((participant) => participant !== ws)
	otherParticipants.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(objToSend));
				}
			 });

	ws.send(JSON.stringify({ text: `sent` }))
}
//-----------------------------------------------

const wsServer = new WebSocket.Server({ noServer: true });
wsServer.on("connection", onConnect);

export default wsServer;