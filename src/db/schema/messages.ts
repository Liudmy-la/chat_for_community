import { InferModel } from 'drizzle-orm'
import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const newMessageSchema = mysqlTable(
	'messages',
	{
		message_id: int('message_id').notNull().primaryKey().autoincrement(),
		chat_id: int('chat_id').notNull(),
		user_id: int('user_id').notNull(),
		message_text: varchar('message_text', { length: 2000 }).notNull(),
		timestamp: timestamp('timestamp').notNull(),
	},
	(table) => ({})
);

export type TNewMessage = InferModel<typeof newMessageSchema, 'insert'>;