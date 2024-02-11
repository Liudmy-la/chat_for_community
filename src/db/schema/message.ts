import { InferModel } from 'drizzle-orm'
import { pgTable, varchar, uuid, uniqueIndex } from 'drizzle-orm/pg-core'

export const newMessageSchema = pgTable(
  'message',
  {
    // id: uuid('id').defaultRandom().primaryKey(),
    // email: varchar('email', { length: 50 }).notNull(),
    // password: varchar('password').notNull(),
    // nickname: varchar('nickname', { length: 50 }).notNull(),
  },
  (table) => ({
    // emailIndex: uniqueIndex('emailIdx').on(table.email), ///unique
    // nicknameIndex: uniqueIndex('nicknameIdx').on(table.nickname), ///unique
  })
)

export type TNewMessage = InferModel<typeof newMessageSchema, 'insert'>

// message_id - INT
// user_id - INT
// message_text - TEXT
// timestamp - DATETIME