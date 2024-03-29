
import {connect} from '../db/dbConnect';
import { desc, eq, and, not, like} from 'drizzle-orm';
import { chatSchema } from '../db/schema/chats';
import {newUserSchema} from '../db/schema/users';
import {newMessageSchema} from '../db/schema/messages';
import {newParticipantSchema} from '../db/schema/participant_junction';
import {WebSocketClient} from "../websocket/connectWebsocket";

function whereIn(column: any, values: any[]): any {
    return column.in(values);
}

// find--analyse data

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

export async function getCommonChats () {
	try {
		const db = await connect();
		const allChats = await db
			.select()
			.from(chatSchema)
			.where(eq(chatSchema.is_private, 0))
			.execute()
		
		
		const commonArray: {id: number, name: string}[] = allChats.map(chat => ({id: chat.chat_id, name: chat.chat_name}));

		return commonArray;
	} catch (error: any) {
		console.error(`Error in getCommonChats: ${error.message}`);
		throw error;
	}
}

export async function allUsers() {
	try {
		const db = await connect();
		const allUsers: {userId: number, userNic: string}[] = await db
			.select({userId: newUserSchema.user_id, userNic: newUserSchema.nickname})
			.from(newUserSchema)
			.execute()
				
		return allUsers;
	} catch (error: any) {
		console.error(`Error in allUsers: ${error.message}`);
		throw error;
	}
}

export async function chatParticipants(chatId: number) {
	try {
		const db = await connect();
		const chatUsers = await db
			.select({userId: newUserSchema.user_id, userNic: newUserSchema.nickname})
			.from(newUserSchema)
			.leftJoin(newParticipantSchema, eq(newParticipantSchema.user_id, newUserSchema.user_id))
			.where(eq(newParticipantSchema.chat_id, chatId))
			.execute()
				
		return chatUsers;
	} catch (error: any) {
		console.error(`Error in chatParticipants: ${error.message}`);
		throw error;
	}
}

export async function getPrivCompanions (userId: number) {
	try {
		const result = await getChats(true, userId);
		const privChatArray : number[] = result.map(chat => chat.chats.chat_id);

		const db = await connect();
		const allChats = await db
			.select()
			.from(newParticipantSchema)
			.leftJoin(newUserSchema, eq(newUserSchema.user_id, newParticipantSchema.user_id))
			.where(
				and(
					whereIn(newParticipantSchema.chat_id, privChatArray),
					not(eq(newParticipantSchema.user_id, userId)))
			)
			.execute()
		
		const allCompanions: any[] = [];
		
		allChats.forEach((chat) => {
				if (!!chat && chat.users !== null && chat.users.nickname !== null) {
					allCompanions.push({chatId: chat.participant__junction.chat_id, user: chat.users.nickname})
				} 
			})
		
		return allCompanions;
	} catch (error: any) {
		console.error(`Error in getPrivCompanions: ${error.message}`);
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
		
		const id = user[0].user_id;
		const nick = user[0].nickname;

		return user.length !== 0 ? {userId: id, userNick: nick} : null;
	} catch (error: any) {
		console.error(`Error in getUser: ${error.message}`);
		throw error;
	}
}

export async function getChatData (chatId: number) {
	try {
		const db = await connect();
		const data = await db
			.select()
			.from(chatSchema)
			.where(eq(chatSchema.chat_id, chatId))
			.execute();
		
		return data[0];
	} catch (error: any) {
		console.error(`Error in getChatData: ${error.message}`);
		throw error;
	}
}

export async function getPreviousMessages (chatId: number) {
	try {
		const db = await connect();

		const messagesInChat = await db
			.select()
			.from(newMessageSchema)
			.where(eq(newMessageSchema.chat_id, chatId))
			.orderBy(desc(newMessageSchema.timestamp))
			.execute();
			
		const chatsHistory = await refineHistoryData(messagesInChat);
			
		return chatsHistory;
	} catch (error: any) {
		console.error(`Error in getPreviousMessages: ${error.message}`);
		throw error;
	}
}

export async function messagesInsideByChunk (db: any, chatId: number, findBy: 'text' | 'user', chunk: string) {
	try {
		const toCompare = findBy === 'text' ? newMessageSchema.message_text : newMessageSchema.user_id

		const messagesInChat = await db
			.select()
			.from(newMessageSchema)
			.where(
				and(
					eq(newMessageSchema.chat_id, chatId),
					like(toCompare, `%${chunk}%`)
				))
			.orderBy(desc(newMessageSchema.timestamp))
			.execute();
			
		
		const chatsHistory = await refineHistoryData(messagesInChat);
						
		return chatsHistory;
	} catch (error: any) {
		console.error(`Error in messagesInsideByChunk: ${error.message}`);
		throw error;
	}
}

export async function searchMessagesByChunk(
			db: any, 
			userId: number, 
			findBy: 'text' | 'user', 
			findAmong: 'groupJoinedChats' | 'privateJoinedChats', 
			chunk: string
) {
	try {				
		const isPrivate = findAmong === 'groupJoinedChats' ? false : true
		
		const result = await getChats(isPrivate, userId);
		const chatArray : number[] = result.map(chat => chat.chats.chat_id);
		
		const toCompare = findBy === 'text' ? newMessageSchema.message_text : newMessageSchema.user_id

		const messages = await db
			.select()
			.from(newMessageSchema)
			.where(
				and(
					whereIn(newMessageSchema.chat_id, chatArray),
					like(toCompare, `%${chunk}%`)
				))
			.orderBy(desc(newMessageSchema.timestamp))
			.execute();

		return messages;
	} catch (error: any) {
		console.error(`Error in searchMessagesByChunk: ${error.message}`);
		throw error;
	}
}


export async function getChatByNickname (userId: number, chunk: string) {
	try {
		const companionsArray: {chatId: number, user: string}[] = await getPrivCompanions(userId);
		const companions = companionsArray.map((companion) => companion.user)

		const db = await connect();
		const userResult = await db
		.select({user: newUserSchema.nickname})
		.from(newUserSchema)
		.where(
			and(
				whereIn(newUserSchema.nickname, companions),
				like(newUserSchema.nickname, `%${chunk}%`)
			))
		.orderBy(desc(newMessageSchema.timestamp))
		.execute();

		const userArray = userResult.map((result) => result.user);
		const chatResult = companionsArray.filter((companion) => userArray.includes(companion.user))
		
		return chatResult;
	} catch (error: any) {
		console.error(`Error in getChatByNickname: ${error.message}`);
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

export async function getWSList (chatId: number) {
	try {
		const db = await connect()
		const participantsList = await db
			.select()
			.from(newParticipantSchema)
			.where(eq(newParticipantSchema.chat_id, chatId))
			.execute()
		
			const websocketsArray: WebSocketClient[] = participantsList.map(participant => {
				if (typeof(participant.websocket) === 'string') {
					return JSON.parse(participant.websocket);
				} else {
					throw Error('websocket is unknown')
				}
			});

		return websocketsArray
	} catch (error: any) {
		console.error(`Error in getWSList: ${error.message}`);
		throw error;
	}
}

// set--update data

export async function isChatExists (chatId: number) {
	try {
		const db = await connect();

		const existingChat = await db
			.select()
			.from(chatSchema)
			.where(eq(chatSchema.chat_id, chatId))
			.execute();
		
		return !!existingChat;
	} catch (error: any) {
		console.error(`Error in isChatExists: ${error.message}`);
		throw error;
	}
}

// deleteChat -> if you are sender or admin

export async function checkUserInChat (userId: number, chatId: number) {
	try {
		const db = await connect();

		const chatConsist = await db
			.select()
			.from(newParticipantSchema)
			.where(
				and(
					eq(newParticipantSchema.user_id, userId),
					eq(newParticipantSchema.chat_id, chatId))
			)
			.execute();
		
		return !!chatConsist;
	} catch (error: any) {
		console.error(`Error in checkUserInChat: ${error.message}`);
		throw error;
	}
}

export async function updateParticipant (userId: number, chatId: number, timeStamt: Date, ws: WebSocketClient) {
	try {
		const db = await connect();

		const pair = await db
		.select()
		.from(newParticipantSchema)
		.where(
			and(
				eq(newParticipantSchema.user_id, userId),
				eq(newParticipantSchema.chat_id, chatId))
		)
		.execute();

		const pair_id = pair[0].participant_id

		await db
		.update(newParticipantSchema)
		.set({connected_at: timeStamt, websocket: ws})
		.where(eq(newParticipantSchema.participant_id, pair_id))
		.execute();
		
	} catch (error: any) {
		console.error(`Error in updateParticipant: ${error.message}`);
		throw error;
	}
}

export async function insertParticipant (userId: number, chatId: number, timeStamp: Date, ws: WebSocketClient) {
	try {
		const db = await connect();
		await db
			.insert(newParticipantSchema)
			.values({chat_id: chatId, user_id: userId, connected_at: timeStamp, websocket: JSON.stringify(ws)})
			.execute();
		
	} catch (error: any) {
		console.error(`Error in insertParticipant: ${error.message}`);
		throw error;
	}
}

export async function memberDelete (userId: number, chatId: number) {
	try {
		const db = await connect();
		
		await db
			.delete(newParticipantSchema)
			.where(
				and(
					eq(newParticipantSchema.user_id, userId),
					eq(newParticipantSchema.chat_id, chatId))
			)
			.execute();

		const checkUser = await db
		.select()
		.from(newParticipantSchema)
		.where(
			and(
				eq(newParticipantSchema.user_id, userId),
				eq(newParticipantSchema.chat_id, chatId))
		)
		.execute();

		return checkUser
				
	} catch (error: any) {
		console.error(`Error in memberDelete: ${error.message}`);
		throw error;
	}
}

export async function insertMessage (userId: number, chatId: number, timeStamp: Date, msg: string) {
	try {
		const db = await connect();
		await db
			.insert(newMessageSchema)
			.values({chat_id: chatId, user_id: userId, timestamp: timeStamp, message_text: msg})
			.execute();	
			
	} catch (error: any) {
		console.error(`Error in insertMessage: ${error.message}`);
		throw error;
	}
}

// updateMessage  -> if you are sender
// deleteMessage ->  if you are sender or admin


// utility fncts

export async function getArray (isPrivate: boolean, userId: number) {
	try {
		const result = await getChats(isPrivate, userId);

		const chatArray : {id: number, name: string}[] = result.map(
				chat => ({id: chat.chats.chat_id, name: chat.chats.chat_name})
			);
		
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

export async function refineHistoryData (array: {
			message_id: number,
			chat_id: number,
			user_id: number,
			message_text: string,
			timestamp: Date,
		}[] ) {
	try {
		const chatHistory: {
				id: number, 
				text: string, 
				timeStamp: Date, 
				sender: string, 
				chat: {chatId: number, chatName: string}
			} [] = [];
		
		for (const msg of array) {
			const sender = await getNickname(msg.user_id);
			const chat = await getChatData(msg.chat_id);
			if(!chat) {
				throw Error (`Can't get chat data.`)
			}

			const message = {
				id: msg.message_id,
				text: msg.message_text,
				timeStamp: msg.timestamp,
				sender: sender,
				chat: {chatId: chat.chat_id, chatName: chat.chat_name || ''}
			}

			chatHistory.push(message);
		};
			
		return chatHistory;
	} catch (error: any) {
		console.error(`Error in refineDate: ${error.message}`);
		throw error;
	}
}