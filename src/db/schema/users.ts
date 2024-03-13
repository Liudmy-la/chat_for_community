import { InferModel } from 'drizzle-orm';
import { mysqlTable, char, varchar, uniqueIndex, int, timestamp } from 'drizzle-orm/mysql-core';

const defaultPhoto = 'https://i.ibb.co/tYmqgt9/avatar.png';

export const newUserSchema = mysqlTable(
	'users',
	{
		user_id: int('user_id').notNull().primaryKey().autoincrement(),
		email: char('email', { length: 50 }).notNull(),
		password: char('password').notNull(),
		nickname: char('nickname', { length: 20 }).notNull(),
		first_name: char('first_name', { length: 50 }),
		last_name: char('last_name', { length: 50 }),
		token: char('token').notNull(),
		registered_at: timestamp('registered_at'),
		user_avatar: varchar('user_avatar', { length: 255 }).default(defaultPhoto),
	},
	(table) => ({
		emailIndex: uniqueIndex('emailIdx').on(table.email), // unique
		nicknameIndex: uniqueIndex('nicknameIdx').on(table.nickname), // unique
	})
);

export type TNewUser = InferModel<typeof newUserSchema, 'insert'>;