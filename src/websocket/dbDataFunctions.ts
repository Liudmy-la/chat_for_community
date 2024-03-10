
import {connect} from '../db/dbConnect';
import { eq, and } from 'drizzle-orm';
import { chatSchema } from '../db/schema/chats';
import {newUserSchema} from '../db/schema/users';
import {newMessageSchema} from '../db/schema/messages';
import {newParticipantSchema} from '../db/schema/participant_junction';
import {WebSocketClient} from "./useWebsocket";

export async function chatExists (chatId: number) {
	const db = await connect();

	const existingChat = await db
		.select()
		.from(chatSchema)
		.where(eq(chatSchema.chat_id, chatId))
		.execute();
	
	return !!existingChat;
}

export async function defineUser (email: string,) {
	const db = await connect();

	const user = await db
    .select()
    .from(newUserSchema)
    .where(eq(newUserSchema.email, email))
    .execute();

	return user;
}

export async function checkInDB (userId: number, chatId: number) {
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
}

export async function updateTime (userId: number, chatId: number, timeStamt: Date) {
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
	.set({connected_at: timeStamt})
	.where(eq(newParticipantSchema.participant_id, pair_id))
	.execute();
}

export async function insertParticipant (userId: number, chatId: number, timeStamp: Date, ws: WebSocketClient) {
	const db = await connect();
	await db
		.insert(newParticipantSchema)
		.values({chat_id: chatId, user_id: userId, connected_at: timeStamp, websocket: ws})
		.execute();
}

export async function insertMessage (userId: number, chatId: number, timeStamp: Date, msg: string) {
	const db = await connect();
	await db
		.insert(newMessageSchema)
		.values({chat_id: chatId, user_id: userId, timestamp: timeStamp, message_text: msg})
		.execute();	
}

export async function getList (chatId: number) {
	const db = await connect()
	const participantsList = await db
		.select()
		.from(newParticipantSchema)
		.where(eq(newParticipantSchema.chat_id, chatId))
		.execute()
	
		const websocketsArray: any[] = participantsList.map(participant => participant.websocket);

	return websocketsArray
}