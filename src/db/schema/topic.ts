import { InferModel } from 'drizzle-orm'
import { pgTable, char, serial, uniqueIndex } from 'drizzle-orm/pg-core'

export const newTopicSchema = pgTable(
  'topic',
  {
    topic_id: serial('topic_id').primaryKey(),
    topic_name: char('topic_name', { length: 50 }).notNull(),
  },
  (table) => ({
    topic_name: uniqueIndex('topicnameIdx').on(table.topic_name), ///unique
  })
)

export type TNewTopic = InferModel<typeof newTopicSchema, 'insert'>