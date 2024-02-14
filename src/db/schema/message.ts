import { InferModel } from 'drizzle-orm'
import { pgTable, serial, varchar, time } from 'drizzle-orm/pg-core'

export const newMessageSchema = pgTable(
  'message',
  {
    message_id: serial('message_id').primaryKey(),
    user_id: serial('user_id').notNull(),
    message_text: varchar('message_text').notNull(),
    timestamp: time('timestamp').notNull(),
  },
  (table) => ({})
)

export type TNewMessage = InferModel<typeof newMessageSchema, 'insert'>