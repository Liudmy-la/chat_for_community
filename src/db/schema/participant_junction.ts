import { InferModel } from 'drizzle-orm';
import { pgTable, integer, date, json } from 'drizzle-orm/pg-core';
// import {chatSchema} from './chats';
// import {newUserSchema} from './users';

export const newParticipantSchema  = pgTable(
  'participant_junc',
  {
	chat_id: integer('chat_id').notNull(),
	user_id: integer('user_id').notNull(),
	connected_at: date('connected_at'),
	websocket: json("websocket"), // as current sessions
  },
)

export type TNewPartJunct = InferModel<typeof newParticipantSchema, 'insert'>