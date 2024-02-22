import { eq } from 'drizzle-orm'
import { Request, Response } from 'express'
import {connect} from '../db/dbConnect'
import { newUserSchema } from '../db/schema/users'
import authenticateUser from '../middlewares/authMiddleware'

export const findUserByNickname = async (req: Request, res: Response) => {
  try {
    authenticateUser(req, res, async () => {
      const { nickname } = req.body //maybe will change to find query

      if (!nickname) {
        return res.status(400).json({ error: 'This username is not a valid' })
      }

      const db = await connect()

      const users = await db
        .select()
        .from(newUserSchema)
        .where(eq(newUserSchema.nickname, nickname))
        .execute()

      if (users.length === 0) {
        return res.status(400).json({ error: 'User not found' })
      } else {
        const { user_id, email, nickname, first_name, last_name, user_avatar } = users[0]
        return res.status(200).json({ user_id, email, nickname, first_name, last_name, user_avatar })
      }
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).send('Internal Server Error')
  }
}
