import { InferModel } from 'drizzle-orm'
import { pgTable, varchar, uuid, uniqueIndex } from 'drizzle-orm/pg-core'

export const newTopicSchema = pgTable(
  'topic',
  {
    // id: uuid('id').defaultRandom().primaryKey(),
    // nickname: varchar('nickname', { length: 50 }).notNull(),
  },
  (table) => ({
    // emailIndex: uniqueIndex('emailIdx').on(table.email), ///unique
    // nicknameIndex: uniqueIndex('nicknameIdx').on(table.nickname), ///unique
  })
)

export type TNewTopic = InferModel<typeof newTopicSchema, 'insert'>

// topic_id - INT
// topic_name - varchar