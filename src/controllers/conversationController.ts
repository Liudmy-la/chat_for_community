import { Request, Response } from "express";

import connect from '../db/dbConnect';
import { eq } from 'drizzle-orm';
import { chatSchema } from '../db/schema/chats';
import {newUserSchema} from '../db/schema/users';
import {newMessageSchema} from '../db/schema/messages';
import {newParticipantSchema} from '../db/schema/participant_junction';

//---------------------------------------------------------
async function getprivChats (isPrivate: string, email: string) {
	const db = await connect();
	const allChats =await db
		.select()
		.from(chatSchema)
		.innerJoin(newParticipantSchema, eq(newParticipantSchema.chat_id, chatSchema.chat_id))
		.innerJoin(newUserSchema, eq(newParticipantSchema.user_id, newUserSchema.user_id))
		.where(eq(chatSchema.is_private, isPrivate))
		.where(eq(newUserSchema.email, email))
		.execute()
	
	return allChats;
}

async function getallChats () {
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

async function getMessages (chatId: number) {
	const db = await connect();
	const messagesInChat = await db
		.select()
		.from(newMessageSchema)
		.where(eq(newMessageSchema.chat_id, chatId))
		.execute();
		
	return messagesInChat;
}

//---------------------------------------------------------

export async function maintainChat (req: Request, res: Response) {
	const chat: any = req.query.id;
	
	const userEmail = 'exaple@box'; // const userEmail = req.userEmail; // ?????? 

	const privChats = await getprivChats('true', userEmail);
	const privChatNames : any[] = privChats.map(chat => chat.chats.name);

	const groupChats = await getallChats();
	const groupsNameArray: any[] = groupChats.map(chat => chat.name);

	if (groupChats.length === 0) {
		return res.status(400).json({
			message: `No Group Chats Available `,
		})
	}

	const messagesInChat = await getMessages (chat);
	const chatsHistory: any[] = messagesInChat.map(async(msg) => {
			const message = {
				id: msg.message_id,
				text: msg.message_text,
				timeStamp: msg.timestamp,
				sender: await getNickname(msg.user_id),
			}

			return message
		});

	// const messOfChatName = chatsHistory.filter((item: string) => {
	// 				const messageTimestamp = JSON.parse(item).timeStamp
	// 				return new Date(messageTimestamp).getTime() < wsTimeSpamp.getTime()
	// 			})
	
	
	
	return res.status(200).json({
		data: {
			privChats: privChatNames,
			groupChats: groupsNameArray,
			// messOfChatName: messOfChatName,
		}
	})
}