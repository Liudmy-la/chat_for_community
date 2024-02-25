import { Request, Response } from "express";

import {connect} from '../db/dbConnect';
import { eq } from 'drizzle-orm';
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
			.innerJoin(newParticipantSchema, eq(newParticipantSchema.chat_id, chatSchema.chat_id))
			.where(eq(newParticipantSchema.user_id, userId))
			.where(eq(chatSchema.is_private, isPrivateData))
			.execute()
				
		return allChats;
	} catch (error: any) {
		console.error(`Error in getPrivChats: ${error.message}`);
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
			.execute();
			
		return messagesInChat;
	} catch (error: any) {
		console.error(`Error in getPrivChats: ${error.message}`);
		throw error;
	}
}

async function getTime (chatId: number, userId: number) {
	try {
		const db = await connect();
		const user = await db
			.select()
			.from(newParticipantSchema)
			.where(eq(newParticipantSchema.chat_id, chatId))
			.where(eq(newParticipantSchema.user_id, userId))
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

async function getArray (isPrivate: boolean, user: number) {
	const result = await getChats(isPrivate, user);
	const chatArray : any[] = result.map(chat => ({id: chat.chats.chat_id, name: chat.chats.chat_name}));
	return chatArray
}

export async function maintainChat (req: Request, res: Response) {
    try {
		const chatId: any = req.query.id;
		
		const userEmail: string = 'example@box'; // result of authenticateUser
		const userId = await getUser(userEmail)

		// const privChats = await getChats(true, userId);
		// const privChatArray : any[] = privChats.map(chat => chat.chats.chat_name);

		// const groupChats = await getChats(false, userId);
		// const groupChatArray: any[] = groupChats.map(chat => ({id: chat.chats.chat_id, name: chat.chats.chat_name}));

		const privChatArray = await getArray(true, userId);
		const groupChatArray = await getArray(false, userId);
		console.log(`privChatArray_______________`, privChatArray)
		console.log(`groupChatArray_______________`, groupChatArray)

		
		const commonChats = await getCommonChats();
		const commonArray: any[] = commonChats.map(chat => ({id: chat.chat_id, name: chat.chat_name}));

		if (commonArray.length === 0) {
			return res.status(400).json({
				message: `No Common Chats Available `,
			})
		}

		const messagesInChat = await getMessages (chatId);

		const connectFrom = await getTime(chatId, userId)

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