import { Request, Response } from "express";

import {connect} from '../db/dbConnect';
import { desc, eq, and } from 'drizzle-orm';
import { chatSchema } from '../db/schema/chats';
import {newUserSchema} from '../db/schema/users';
import {newMessageSchema} from '../db/schema/messages';
import {newParticipantSchema} from '../db/schema/participant_junction';

//---------------------------------------------------------
async function getChats (isPrivate: boolean, userId: number) {
	try {
		const isPrivateData = isPrivate ? 1 : 0;
		const db = await connect();
		const allChats = await db
			.select()
			.from(chatSchema)
			.leftJoin(newParticipantSchema, eq(newParticipantSchema.chat_id, chatSchema.chat_id))
			.where(
				and(
					eq(chatSchema.is_private, isPrivateData),
					eq(newParticipantSchema.user_id, userId))
			)
			.execute()
				
		return allChats;
	} catch (error: any) {
		console.error(`Error in getPrivChats: ${error.message}`);
		throw error;
	}
}

async function getArray (isPrivate: boolean, user: number) {
	try {
		const result = await getChats(isPrivate, user);
		const chatArray : any[] = result.map(chat => ({id: chat.chats.chat_id, name: chat.chats.chat_name}));
		
		const uniqueArray = chatArray.filter((obj, index, self) =>
				index === self.findIndex((t) => (
				t.id === obj.id
			))
		);
		
		return uniqueArray
	} catch (error: any) {
		console.error(`Error in getArray: ${error.message}`);
		throw error;
	}
}

async function getCommonChats () {
	try {
		const db = await connect();
		const allChats = await db
			.select()
			.from(chatSchema)
			.where(eq(chatSchema.is_private, 0))
			.execute()
		
		return allChats;
	} catch (error: any) {
		console.error(`Error in getCommonChats: ${error.message}`);
		throw error;
	}
}

async function getNickname (userId: number) {
	try {
		const db = await connect();
		const userNick = await db
			.select()
			.from(newUserSchema)
			.where(eq(newUserSchema.user_id, userId))
			.execute();
		
		const nickname = userNick[0].nickname
		return nickname;
	} catch (error: any) {
		console.error(`Error in getNickname: ${error.message}`);
		throw error;
}
}

async function getUser (email: string) {
	try {
		const db = await connect();
		const user = await db
			.select()
			.from(newUserSchema)
			.where(eq(newUserSchema.email, email))
			.execute();
		
		const id = user[0].user_id
		return id;
	} catch (error: any) {
		console.error(`Error in getUser: ${error.message}`);
		throw error;
	}
}

async function getMessages (chatId: number) {
	try {
		const db = await connect();
		const messagesInChat = await db
			.select()
			.from(newMessageSchema)
			.where(eq(newMessageSchema.chat_id, chatId))
			.orderBy(desc(newMessageSchema.timestamp))
			.limit(8)
			.execute();
			
		return messagesInChat;
	} catch (error: any) {
		console.error(`Error in getPrivChats: ${error.message}`);
		throw error;
	}
}

async function getСonnectTime (chatId: number, userId: number) {
	try {
		const db = await connect();
		const user = await db
			.select()
			.from(newParticipantSchema)
			.where(
				and(
					eq(newParticipantSchema.chat_id, chatId),
					eq(newParticipantSchema.user_id, userId)
				)
			)
			.execute();
		
		const connected = user[0].connected_at
		return connected ? new Date(connected) : false;
	} catch (error: any) {
		console.error(`Error in getPrivChats: ${error.message}`);
		throw error;
	}
}

// async function memberDelete (userId: number) {
// 	const db = await connect();
	
// 	await db
// 		.delete(newParticipantSchema)
// 		.where(eq(newParticipantSchema.user_id, userId))
// 		.execute();
// }

//---------------------------------------------------------

export async function maintainChat (req: Request, res: Response) {
    try {
		const chatId: any = req.query.id;
		
		const userEmail: string = 'example@box'; // result of authenticateUser
		const userId = await getUser(userEmail);

		const privChatArray = await getArray(true, userId);
		const groupChatArray = await getArray(false, userId);
	console.log(`privChatArray: `, privChatArray)
		
		const commonChats = await getCommonChats();
		const commonArray: any[] = commonChats.map(chat => ({id: chat.chat_id, name: chat.chat_name}));

		if (commonArray.length === 0) {
			return res.status(400).json({
				message: `No Common Chats Available `,
			})
		}

		const messagesInChat = await getMessages (chatId);

		const connectFrom = await getСonnectTime(chatId, userId)
	console.log(`connectFrom: `, connectFrom)

		const chatsHistory: any[] = []
		
		for (const msg of messagesInChat) {
				const message = {
					id: msg.message_id,
					text: msg.message_text,
					timeStamp: msg.timestamp,
					sender: await getNickname(msg.user_id),
				}

				chatsHistory.push(message);
			};
			
		let prevMessages = chatsHistory.filter((item) => {
				const messageTimestamp = item.timeStamp;
				return connectFrom ? new Date(messageTimestamp).getTime() < connectFrom.getTime() : null
			})
		
		if (!messagesInChat || prevMessages.length === 0) {
			prevMessages = []
		}
		
		return res.status(200).json({
			data: {
				privChats: privChatArray,
				groupChats: groupChatArray,
				commonChats: commonArray,
				messOfChatName: prevMessages,
			}
		})

	} catch (error: any) {
    	console.error(`Error in maintainChat: ${error.message}`);
    	return res.status(500).json({ message: "_maintainChat Error" });
    }
}