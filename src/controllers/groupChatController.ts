import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import connect from '../db/dbConnect';
import { chatSchema, TNewChats } from '../db/schema/chats';
import { newUserSchema } from '../db/schema/users';
import { newParticipantSchema, TNewPartJunct } from '../db/schema/participant_junction';
import authenticateUser from '../middlewares/authMiddleware';

export const createGroupChat = async (req: Request, res: Response) => {
	try {
		authenticateUser(req, res, async () => {
			const { name, description, is_private, nickname, avatar } = req.body
			const userEmail = req.userEmail

			if (userEmail === undefined) {
				return res.status(401).json({ error: 'Invalid or missing user email' })
			}

			const db = await connect()

			const existingChat = await db
				.select()
				.from(chatSchema)
				.where(eq(chatSchema.name, name))
				.execute()

			if (existingChat.length > 0) {
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

			let admin_id = null;
			if (!is_private) {
				admin_id = user[0].user_id;
			}

			const newChat: TNewChats = {		
				name,
				description,
				is_private,
				admin_id,
				avatar
			}
			await db.insert(chatSchema).values(newChat).execute()

			const result  = await db
			.select()
			.from(newUserSchema)
			.where(eq(chatSchema.name, name))
			.execute()

			const chat_id = result[0].user_id;

			const participant: TNewPartJunct = {
				chat_id: chat_id,
				user_id: user[0].user_id,
			};
			await db.insert(newParticipantSchema).values(participant).execute();

			if (is_private && nickname) {
				const participantUser = await db
					.select()
					.from(newUserSchema)
					.where(eq(newUserSchema.nickname, nickname))
					.execute();
		
				if (participantUser.length === 0) {
					return res.status(400).json({ error: `User with nickname ${nickname} not found` });
				}
		
				const privateParticipant: TNewPartJunct = {
					chat_id: chat_id,
					user_id: participantUser[0].user_id,
				};
				await db.insert(newParticipantSchema).values(privateParticipant).execute();
			}
		
			// return res.status(201).json('Chat successfully created')
			return res.status(201).json({
				chat: {
					chat_id,
					is_private,
					name,
					description,
					avatar,
				}
			})
		})
	} catch (error) {
		console.error('Error:', error)
		res.status(500).send('Internal Server Error')
	}
}