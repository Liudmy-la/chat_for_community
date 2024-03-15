import WebSocket from "ws";
import {Request} from "express";
import {
		getUser, isChatExists, checkUserInChat, getWSList, 
		updateParticipant, insertParticipant, insertMessage
	} from "utils/dbConnectFunctions";

export interface WebSocketClient extends WebSocket {
	send: (data: WebSocket.Data) => void;
	readyState: 0 | 1 | 2 | 3;
}
//-----------------------------------------------
const onConnect = async (ws: WebSocketClient, req: Request) => {
	try {
		const url: string = req.url;

		const email: string = url.substring(url.indexOf('user-') + 5);

		const user: {userId: number, userNick: string} | null = await getUser(email);
		
		if (user === null) {
			throw new Error("User not found");
		}
	
		const chatId: number | undefined = await onIncomeData(url, user.userId, ws);

		if (chatId !== undefined) {
			ws.on('message', (msg: string) => onMessage(msg, user, chatId, ws));
		}

	} catch (error: any) {
		console.error(`Error onConnect : ${error.message}`);
	}
}

async function onIncomeData (url: string, userId: number, ws: WebSocketClient): Promise<number | undefined> {	
	try {
		const connectTime: Date = new Date();

		let chatId: number | undefined;

		if (url.startsWith('/group-chat-')) {
			chatId = Number(url.substring(12));

			const isChat = await isChatExists(chatId);
			if (!isChat) {
				throw new Error (`This chat doesn't exists`);
			}

			const chatConsist = await checkUserInChat(userId, chatId);
			if (chatConsist) {
				await updateParticipant(userId, chatId, connectTime, ws);
			}
			else {
				await insertParticipant(userId, chatId, connectTime, ws);
			}

			ws.send(JSON.stringify({ text: `Welcome! << ${chatId} >> ` }));
			
		} else if (url.startsWith('/priv-chat-')) {
			chatId = Number(url.substring(11));

			const isChat = await isChatExists(chatId);
			if (!isChat) {
				throw new Error (`This chat doesn't exists`);
			}

			const chatConsist = await checkUserInChat(userId, chatId);		
			if (chatConsist) {
				await updateParticipant(userId, chatId, connectTime, ws);
			}

			ws.send(JSON.stringify({ text: `Hello! << ${chatId} >> ` }));
			
		}	
		return chatId;
	} catch (error: any) {
		console.error(`Error onIncomeData : ${error.message}`);
		return;
	}
}

const onMessage = async (msg: string, user: { userId: number, userNick: string}, chat: number, ws: WebSocketClient) => {	
	try {
		if (user.userId === undefined) {
			throw new Error("User ID is undefined");
		}

		const receivedObj = JSON.parse(msg);
		const newTime: Date = receivedObj.timeStamp;
		const newMsg: string = receivedObj.text;

		ws.readyState === WebSocket.OPEN && await insertMessage(user.userId, chat, newTime, newMsg);

		const connectedWS = await getWSList(chat);
		const otherParticipants = connectedWS.filter((participant) => participant !== ws);

		const objToSend = {
			text: newMsg,
			nic: user.userNick,
			timeStamp: new Date(),
		};

		otherParticipants.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(JSON.stringify(objToSend));
					}
				});

		ws.send(JSON.stringify({ text: `sent`,  timeStamp: objToSend.timeStamp}));

	} catch (error: any) {
		console.error(`Error onMessage : ${error.message}`);
	}
}
//-----------------------------------------------

const wsServer = new WebSocket.Server({ noServer: true });
wsServer.on("connection", onConnect);

export default wsServer;