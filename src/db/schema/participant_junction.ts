import { InferModel } from 'drizzle-orm';
import { pgTable, integer } from 'drizzle-orm/pg-core';
// import {chatSchema} from './chats';
// import {newUserSchema} from './users';

export const newParticipantSchema  = pgTable(
  'participant_junc',
  {
	chat_id: integer('chat_id'),
	user_id: integer('user_id'),
  },
)

export type TNewPartJunct = InferModel<typeof newParticipantSchema, 'insert'>