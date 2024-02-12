import { InferModel } from 'drizzle-orm'
import { pgTable, varchar, uuid, uniqueIndex } from 'drizzle-orm/pg-core'

export const newMessJunctSchema = pgTable(
  'message_junction',
  {
    // id: uuid('id').defaultRandom().primaryKey(),
    // nickname: varchar('nickname', { length: 50 }).notNull(),
  },
  (table) => ({
    // emailIndex: uniqueIndex('emailIdx').on(table.email), ///unique
    // nicknameIndex: uniqueIndex('nicknameIdx').on(table.nickname), ///unique
  })
)

export type TNewMessJunct = InferModel<typeof newMessJunctSchema, 'insert'>

// chat_id - INT
// message_id - INT