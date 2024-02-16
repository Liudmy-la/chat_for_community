import { InferModel } from 'drizzle-orm'
import { pgTable, integer } from 'drizzle-orm/pg-core'

export const newMessJunctSchema = pgTable(
  'message_junction',
  {
	chat_id: integer('chat_id'),
	message_id: integer('message_id'),
  },
)

export type TNewMessJunct = InferModel<typeof newMessJunctSchema, 'insert'>