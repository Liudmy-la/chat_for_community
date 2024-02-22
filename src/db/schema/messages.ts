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

export type TNewMessage = InferModel<typeof newMessageSchema, 'insert'>


// import { InferModel } from 'drizzle-orm'
// import { pgTable, serial, integer, varchar, date } from 'drizzle-orm/pg-core'

// export const newMessageSchema = pgTable(
//   'messages',
//   {
//     message_id: serial('message_id'),
//     chat_id: integer('chat_id').notNull(),
//     user_id: integer('user_id').notNull(),
//     message_text: varchar('message_text').notNull(),
//     timestamp: date('timestamp').notNull(),
//   },
//   (table) => ({})
// )

// export type TNewMessage = InferModel<typeof newMessageSchema, 'insert'>