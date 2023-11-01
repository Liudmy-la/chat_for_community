import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import { Request, Response } from 'express'
import connect from '../db/dbConnect'
import { newUserSchema } from '../db/schema/users'

interface DecodedToken {
  email: string
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Token is required' })
    }

    const db = await connect()
    const users = await db.select().from(newUserSchema).execute()

    const formattedUsers = users.map((user) => {
      const { id, email, nickname, first_name, last_name, avatar } = user
      return { id, email, nickname, first_name, last_name, avatar }
    })

    return res.status(200).json({ users: formattedUsers })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).send('Internal Server Error')
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Token is required' })
    }
    const { password } = req.body

    const decoded = jwt.verify(token, `${process.env.SECRET_TOKEN_KEY}`) as DecodedToken
    const userEmail = decoded.email

    const db = await connect()

    const users = await db
      .select()
      .from(newUserSchema)
      .where(eq(newUserSchema.email, userEmail))
      .execute()

    if (users.length === 0) {
      return res.status(400).json({ error: 'User not found' })
    }

    const storedPassword = users[0].password

    const passwordMatch = await bcrypt.compare(password, storedPassword)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    await db.delete(newUserSchema).where(eq(newUserSchema.email, userEmail)).execute()

    return res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).send('Internal Server Error')
  }
}
