import { InferModel } from 'drizzle-orm'
import { pgTable, serial, varchar, date } from 'drizzle-orm/pg-core'

export const newMessageSchema = pgTable(
  'message',
  {
    message_id: serial('message_id').primaryKey(),
    chat_id: serial('chat_id').notNull(),
    user_id: serial('user_id').notNull(),
    timestamp: date('timestamp').notNull(),
    message_text: varchar('message_text'),
  },
  (table) => ({})
)

export type TNewMessage = InferModel<typeof newMessageSchema, 'insert'>