import { InferModel } from 'drizzle-orm'
import { pgTable, char, varchar, uuid, uniqueIndex, serial, date } from 'drizzle-orm/pg-core'

const defaultPhoto = 'https://i.ibb.co/tYmqgt9/avatar.png'

export const newUserSchema = pgTable(
	'users',
	{
		// id: uuid('id').defaultRandom().primaryKey(),
		user_id: serial('id').primaryKey(),
		email: char('email', { length: 50 }).notNull(),
		password: char('password').notNull(),
		nickname: char('nickname', { length: 50 }).notNull(),
		first_name: char('first_name', { length: 50 }),
		last_name: varchar('last_name', { length: 50 }),
		token: char('token'),
		createdAt: date('created_at'),
		avatar: varchar('avatar', { length: 255 }).default(defaultPhoto),
	},
	(table) => ({
		emailIndex: uniqueIndex('emailIdx').on(table.email), ///unique
		nicknameIndex: uniqueIndex('nicknameIdx').on(table.nickname), ///unique
	})
)

export type TNewUser = InferModel<typeof newUserSchema, 'insert'>