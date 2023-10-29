import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { eq } from 'drizzle-orm'
import connect from '../db/dbConnect'
import { generateToken } from '../utils/generateToken'
import { newUserSchema, TNewUser } from '../db/schema/users'

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, nickname } = req.body
    const db = await connect()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' })
    }

    const minPasswordLength = 6
    if (password.length < minPasswordLength) {
      return res
        .status(400)
        .json({ error: `Password must be at least ${minPasswordLength} characters long` })
    }

    const minNicknameLength = 3
    if (nickname.length < minNicknameLength) {
      return res.status(400).json({ error: 'Nickname must be at least 3 characters long' })
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
    const generatedToken = await generateToken({ email })

    const newUser: TNewUser = {
      email,
      password: hashedPassword,
      nickname,
      token: generatedToken,
      createdAt: new Date().toISOString(),
    }

    await db.insert(newUserSchema).values(newUser).execute()

    return res.status(201).json({ token: generatedToken })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).send('Internal Server Error')
  }
}

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const db = await connect()

    const user = await db
      .select()
      .from(newUserSchema)
      .where(eq(newUserSchema.email, email))
      .execute()

    if (user.length === 0) {
      return res.status(400).json({ error: 'User with this email does not exist' })
    }

    const storedPassword = user[0].password

    const passwordMatch = await bcrypt.compare(password, storedPassword)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    const newToken = generateToken({ email })

    await db
      .update(newUserSchema)
      .set({ token: newToken })
      .where(eq(newUserSchema.email, email))
      .execute()

    return res.status(200).json({ token: newToken })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).send('Internal Server Error')
  }
}
