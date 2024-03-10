
import {connect} from '../db/dbConnect';
import { desc, eq, and } from 'drizzle-orm';
import { chatSchema } from '../db/schema/chats';
import {newUserSchema} from '../db/schema/users';
import {newMessageSchema} from '../db/schema/messages';
import {newParticipantSchema} from '../db/schema/participant_junction';


export async function getChats (isPrivate: boolean, userId: number) {
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
		console.error(`Error in getChats: ${error.message}`);
		throw error;
	}
}

export async function getArray (isPrivate: boolean, user: number) {
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

export async function getCommonChats () {
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

export async function getNickname (userId: number) {
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

export async function getUser (email: string) {
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

export async function getMessages (chatId: number) {
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
		console.error(`Error in getMessages: ${error.message}`);
		throw error;
	}
}

export async function getСonnectTime (chatId: number, userId: number) {
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
		
		console.log(`connected user data: `, user)
		
		const connected = user[0].connected_at
		return connected ? new Date(connected) : false;
	} catch (error: any) {
		console.error(`Error in getСonnectTime: ${error.message}`);
		throw error;
	}
}

export async function memberDelete (userId: number) {
	const db = await connect();
	
	await db
		.delete(newParticipantSchema)
		.where(eq(newParticipantSchema.user_id, userId))
		.execute();
}
