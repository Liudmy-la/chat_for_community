import WebSocket from "ws";
import { Request} from "express";
import {chatExists, defineUser, checkInDB, updateTime, insertParticipant, insertMessage, getWSList} from "../utils/dbConnectWSFunctions";

export interface WebSocketClient extends WebSocket {
	send: (data: WebSocket.Data) => void;
	readyState: 0 | 1 | 2 | 3;
}
//-----------------------------------------------
const onConnect = () => async (ws: WebSocketClient, req: Request) => {
	try {
		const url: string = req.url;

		const user_email: string = url.substring(url.indexOf('user-') + 5);

		const searchUser = await defineUser(user_email);
		const user_id: number = searchUser[0].user_id;

		onIncomeData(url, user_id, ws)

		ws.on('message', onMessage);

	} catch (error: any) {
		console.error(`Error onConnect : ${error.message}`);
	}
}

async function onIncomeData (url: string, user_id: number, ws: WebSocketClient) {	
	try {
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
	} catch (error: any) {
		console.error(`Error onIncomeData : ${error.message}`);
	}
}

const onMessage = (msg: string) => async (user_id: number, chat_id: number, ws: WebSocketClient, msg: string) => {	
	const receivedObj = JSON.parse(msg);
	const newTime: Date = receivedObj.timeStamp;
	const newMsg: string = receivedObj.text;

	await insertMessage(user_id, chat_id, newTime, newMsg);

	const connectedWS = await getWSList(chat_id);
	const otherParticipants = connectedWS.filter((participant) => participant !== ws);

	const objToSend = {
		text: newMsg,
		nic: user_id,
		timeStamp: new Date(),
	};

	otherParticipants.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(objToSend));
				}
			 });

	ws.send(JSON.stringify({ text: `sent`,  timeStamp: objToSend.timeStamp}));
}
//-----------------------------------------------

const wsServer = new WebSocket.Server({ noServer: true });
wsServer.on("connection", onConnect);

export default wsServer;