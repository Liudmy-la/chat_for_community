import { InferModel } from 'drizzle-orm'
import { pgTable, varchar, uuid, uniqueIndex } from 'drizzle-orm/pg-core'

export const newRelTopicSchema = pgTable(
  'topic_junction',
  {
    // id: uuid('id').defaultRandom().primaryKey(),
    // nickname: varchar('nickname', { length: 50 }).notNull(),
  },
  (table) => ({
    // emailIndex: uniqueIndex('emailIdx').on(table.email), ///unique
    // nicknameIndex: uniqueIndex('nicknameIdx').on(table.nickname), ///unique
  })
)

export type TNewPartJunct = InferModel<typeof newRelTopicSchema, 'insert'>

// chat_id - INT
// topic_id - INT