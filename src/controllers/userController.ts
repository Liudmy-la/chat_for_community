import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { eq } from 'drizzle-orm'
import connect from '../db/dbConnect'
import { generateToken } from '../utils/generateToken'
import { newUserSchema, TNewUser } from '../db/schema/users'

export const postUser = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, nickname } = req.body
    const db = await connect()

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' })
    }

    const minPasswordLength = 6
    if (password.length < minPasswordLength) {
      return res
        .status(400)
        .json({ error: `Password must be at least ${minPasswordLength} characters long` })
    }

    const existingUser = await db
      .select()
      .from(newUserSchema)
      .where(eq(newUserSchema.email, email))
      .execute()

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User with email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser: TNewUser = {
      email,
      password: hashedPassword,
      nickname,
      token: generateToken({ email }),
      createdAt: new Date().toISOString(),
    }

    await db.insert(newUserSchema).values(newUser).execute()

    return res.status(201).json(newUser)
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).send('Internal Server Error')
  }
}
