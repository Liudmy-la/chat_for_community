import { eq } from 'drizzle-orm'
import { Request, Response } from 'express'
import connect from '../db/dbConnect'
import { chatSchema, TNewChats } from '../db/schema/chats'
import { newUserSchema } from '../db/schema/users'
import { authenticateUser } from '../middlewares/authMiddleware'

import * as connectToController from "./connectToController";


export const createGroupChat = async (req: Request, res: Response) => {
  try {
    authenticateUser(req, res, async () => {
      const { name, description } = req.body
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

      const { id: adminId } = user[0]

      const newChat: TNewChats = {
		adminId: [adminId],
        name,
        description,
        userIds: [adminId],
      }
      await db.insert(chatSchema).values(newChat).execute()

	//   const { id: newChatId } = await db
	//   .insert(chatSchema)
	//   .values(newChat)
	//   .returning(chatSchema.id)
	//   .execute()
	//   .then(result => result[0]);
	connectToController.handleNewChat('150');

      return res.status(201).json('Chat successfully created')
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).send('Internal Server Error')
  }
}
