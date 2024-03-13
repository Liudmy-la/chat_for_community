import { eq, and } from 'drizzle-orm';
import { Request, Response } from 'express';
import {connect} from '../db/dbConnect';
import { chatSchema, TNewChats } from '../db/schema/chats';
import { newUserSchema } from '../db/schema/users';
import { newParticipantSchema, TNewPartJunct } from '../db/schema/participant_junction';
import authenticateUser from '../middlewares/authMiddleware';
import handleErrors from "../utils/handleErrors";

async function createNewChat(
		initUserId: number,
		isPrivate: boolean, 
		newChatName: string, 
		toInviteId?: number, 
		description?: string, 
		avatar?: string,
	) {	
		try {
		const db = await connect();

		const newChat: TNewChats = {		
			chat_name: newChatName,
			description: description,
			is_private: isPrivate ? 1 : 0,
			admin_id: isPrivate ? undefined : initUserId,
			chat_avatar: avatar
		}
		await db.insert(chatSchema).values(newChat).execute()

		const result = await db
				.select()
				.from(chatSchema)
				.where(eq(chatSchema.chat_name, newChatName))
				.execute()

		const chatId = result[0].chat_id;
		
		const participant_1: TNewPartJunct = {
			chat_id: chatId,
			user_id: initUserId,
		};
		
		await db.insert(newParticipantSchema).values(participant_1).execute();
		
		if (toInviteId) {
			const participant_2: TNewPartJunct = {
			chat_id: chatId,
			user_id: toInviteId,
			};
			await db.insert(newParticipantSchema).values(participant_2).execute();
		}
		return newChat
	} catch (error: any) {
		console.error(`Error in createNewChat: ${error.message}`);
		throw error;
	}
}

async function checkPrivateChats(initUserId: number, toInviteId: number) {
    try {
		const db = await connect();

		const initUserchats = await db
		.select()
		.from(chatSchema)
		.innerJoin(newParticipantSchema, eq(newParticipantSchema.chat_id, chatSchema.chat_id))
		.where(
			and(
				eq(chatSchema.is_private, 1),
				eq(newParticipantSchema.user_id, initUserId))
		)
		.execute()

		const toInvitechats = await db
		.select()
		.from(chatSchema)
		.innerJoin(newParticipantSchema, eq(newParticipantSchema.chat_id, chatSchema.chat_id))
		.where(
			and(
				eq(chatSchema.is_private, 1),
				eq(newParticipantSchema.user_id, toInviteId))
		)
		.execute()

		const initUserArray = initUserchats.map((chat: any) => chat.chats.chat_id)
		const toInviteArray = toInvitechats.map((chat: any) => chat.chats.chat_id)

		let result
		for (let id of initUserArray) {
			if (toInviteArray.includes(id)) {
				result = id
				return
			}
		}

        return result;
    } catch (error: any) {
        console.error(`Error in checkPrivateChats: ${error.message}`);
        throw error;
    }
}

export const createGroupChat = async (req: Request, res: Response) => {
	try {
		authenticateUser(req, res, async () => {
			const { chatName, description, isPrivate, toInviteNick, chatAvatar } = req.body;
			const userEmail = req.userEmail;

			if (userEmail === undefined) {
				return res.status(401).json({ error: 'Authentication failed' })
			}

	//test
	// const isPrivate = false;
	// const userEmail = 'example@box'
	// const chatName = 'strange chat'
	// const description = 'new way'
	// const chatAvatar = ''
	// const toInviteNick = 'uso01'

			const db = await connect()

			const existingChat = await db
				.select()
				.from(chatSchema)
				.where(eq(chatSchema.chat_name, chatName))
				.execute()

			if (existingChat.length !== 0) {
			return res.status(400).json({ error: 'Chat with this name already exists' })
			}

			const user = await db
				.select()
				.from(newUserSchema)
				.where(eq(newUserSchema.email, userEmail))
				.execute()

			if (user.length === 0) {
			return res.status(400).json({ error: 'User not found' })
			}

			const initUserId: number = user[0].user_id;
			const initUserNick: string = user[0].nickname;

			let newChat;

			if (!isPrivate) {
				newChat = await createNewChat(initUserId, isPrivate, chatName, undefined, description, chatAvatar);
			}

			if (isPrivate && toInviteNick) {
				const participantUser = await db
					.select()
					.from(newUserSchema)
					.where(eq(newUserSchema.nickname, toInviteNick))
					.execute();
		
				if (participantUser.length === 0) {
					return res.status(400).json({ error: `User with nickname ${toInviteNick} not found` });
				}

				const toInviteId = participantUser[0].user_id;

				const alreadyExists = await checkPrivateChats(initUserId, toInviteId);					
				if (alreadyExists) {
					return res.status(400).json({ error: `The chat with ${toInviteNick} exists` });
				}
				
				const newChatName = `${initUserNick}-${toInviteNick}`;
				newChat = await createNewChat(initUserId, isPrivate, newChatName, toInviteId);
			}
		
			// return res.status(201).json('Chat successfully created')
			return res.status(201).json({newChat})
		})
	} catch (error) {
		console.error('Error:', error)
		res.status(500).send('Internal Server Error')
	}
}