import { InferModel } from 'drizzle-orm';
import { mysqlTable, int, datetime, json } from 'drizzle-orm/mysql-core';

export const newParticipantSchema = mysqlTable(
	'participant__junction',
	{
		participant_id: int('chat_id').notNull().primaryKey().autoincrement(),
		chat_id: int('chat_id').notNull(),
		user_id: int('user_id').notNull(),
		connected_at: datetime('connected_at'),
		websocket: json('websocket'), // as current sessions
	},
);

export type TNewPartJunct = InferModel<typeof newParticipantSchema, 'insert'>


// import { InferModel } from 'drizzle-orm';
// import { pgTable, integer, date, json } from 'drizzle-orm/pg-core';

// export const newParticipantSchema  = pgTable(
//   'participant__junction',
//   {
// 	chat_id: integer('chat_id').notNull(),
// 	user_id: integer('user_id').notNull(),
// 	connected_at: date('connected_at'),
// 	websocket: json("websocket"), // as current sessions
//   },
// )

// export type TNewPartJunct = InferModel<typeof newParticipantSchema, 'insert'>