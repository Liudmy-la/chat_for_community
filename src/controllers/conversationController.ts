import { Request, Response } from "express";

import connect from '../db/dbConnect';
import { eq } from 'drizzle-orm';
import { chatSchema } from '../db/schema/chats';
import {newUserSchema} from '../db/schema/users';
import {newMessageSchema} from '../db/schema/messages';
import {newParticipantSchema} from '../db/schema/participant_junction';

//---------------------------------------------------------
async function getPrivChats (isPrivate: string, userId: number) {
	const db = await connect();
	const allChats =await db
		.select()
		.from(chatSchema)
		.innerJoin(newParticipantSchema, eq(newParticipantSchema.chat_id, chatSchema.chat_id))
		.where(eq(chatSchema.is_private, isPrivate))
		.where(eq(newParticipantSchema.user_id, userId))
		.execute()
	
	return allChats;
}

async function getGroupChats () {
	const db = await connect();
	const allChats = await db
		.select()
		.from(chatSchema)
		.where(eq(chatSchema.is_private, 'false')) // string instead of boolean
		.execute()
	
	return allChats;
}

async function getNickname (userId: number) {
	const db = await connect();
	const userNick = await db
		.select()
		.from(newUserSchema)
		.where(eq(newUserSchema.user_id, userId))
		.execute();
	
	const nickname = userNick[0].nickname
	return nickname;
}

async function getUser (email: string) {
	const db = await connect();
	const user = await db
		.select()
		.from(newUserSchema)
		.where(eq(newUserSchema.email, email))
		.execute();
	
	const user_id = user[0].user_id
	return user_id;
}

async function getMessages (chatId: number) {
	const db = await connect();
	const messagesInChat = await db
		.select()
		.from(newMessageSchema)
		.where(eq(newMessageSchema.chat_id, chatId))
		.execute();
		
	return messagesInChat;
}

async function getTime (chatId: number, userId: number) {
	const db = await connect();
	const user = await db
		.select()
		.from(newParticipantSchema)
		.where(eq(newParticipantSchema.chat_id, chatId))
		.where(eq(newParticipantSchema.user_id, userId))
		.execute();
	
	const connected = user[0].connected_at
	return connected ? new Date(connected) : false;
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
	const chat: any = req.query.id;
	
	const userEmail: string = 'exaple@box'; // result of authenticateUser
	const user = await getUser(userEmail)

	const privChats = await getPrivChats('true', user);
	const privChatNames : any[] = privChats.map(chat => chat.chats.name);

	const groupChats = await getGroupChats();
	const groupsNameArray: any[] = groupChats.map(chat => chat.name);

	if (groupChats.length === 0) {
		return res.status(400).json({
			message: `No Group Chats Available `,
		})
	}

	const messagesInChat = await getMessages (chat);
	const connectFrom = await getTime(chat, user)

	const chatsHistory: any[] = messagesInChat.map(async(msg) => {
			const message = {
				id: msg.message_id,
				text: msg.message_text,
				timeStamp: msg.timestamp,
				sender: await getNickname(msg.user_id),
			}

			return message
		});
		
	const prevMessages = chatsHistory.filter((item: string) => {
			const messageTimestamp = JSON.parse(item).timeStamp
			return connectFrom ? new Date(messageTimestamp).getTime() < connectFrom.getTime() : null
		})
		
	
	return res.status(200).json({
		data: {
			privChats: privChatNames,
			groupChats: groupsNameArray,
			messOfChatName: prevMessages,
		}
	})
}