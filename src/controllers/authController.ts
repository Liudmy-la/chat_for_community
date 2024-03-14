import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import {connect} from '../db/dbConnect';
import { generateToken } from '../utils/generateToken';
import { newUserSchema, TNewUser } from '../db/schema/users';
import handleErrors from "../utils/handleErrors";

export const registerUser = async (req: Request, res: Response) => {
	try {
		const { email, password, nickname, first_name, last_name } = req.body
		const db = await connect()

		const existingUserEmail = await db
			.select()
			.from(newUserSchema)
			.where(eq(newUserSchema.email, email))
			.execute()

		const existingUserNickname = await db
			.select()
			.from(newUserSchema)
			.where(eq(newUserSchema.nickname, nickname))
			.execute()

		if (existingUserEmail.length > 0) {
			return res.status(400).json({ error: 'User with this email already exists' })
		}

		if (existingUserNickname.length > 0) {
			return res.status(400).json({ error: 'User with this nickname already exists' })
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const generatedToken = generateToken({ email })

		const newUser: TNewUser = {
			email,
			password: hashedPassword,
			nickname,
			first_name,
			last_name,
			token: generatedToken,
			registered_at: new Date(),
		}

		await db.insert(newUserSchema).values(newUser).execute()

		return res.status(201).json({ token: generatedToken })
	} catch (error) {
		handleErrors(error, res, 'registerUser');
		return;
	}
}

export const loginUser = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		const db = await connect();

		const user = await db
			.select()
			.from(newUserSchema)
			.where(eq(newUserSchema.email, email))
			.execute()

		if (user.length === 0) {
			return res.status(400).json({ error: 'User with this email does not exist' });
		}

		const storedPassword = user[0].password;

		const passwordMatch = await bcrypt.compare(password, storedPassword)

		if (!passwordMatch) {
			return res.status(401).json({ error: 'Invalid password' });
		}

		const newToken = generateToken({ email });

		await db
			.update(newUserSchema)
			.set({ token: newToken })
			.where(eq(newUserSchema.email, email))
			.execute()

		return res.status(200).json({ token: newToken })
	} catch (error) {
		handleErrors(error, res, 'loginUser');
		return
	}
}
