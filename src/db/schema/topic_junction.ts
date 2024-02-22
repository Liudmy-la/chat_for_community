import { InferModel } from 'drizzle-orm';
import { mysqlTable, int } from 'drizzle-orm/mysql-core';

export const newRelTopicSchema = mysqlTable(
	'topic_junction',
	{
		chat_id: int('chat_id'),
		topic_id: int('user_id'),
	},
);

export type TNewPartJunct = InferModel<typeof newRelTopicSchema, 'insert'>



// import { InferModel } from 'drizzle-orm'
// import { pgTable, integer } from 'drizzle-orm/pg-core'

// export const newRelTopicSchema = pgTable(
//   'topic_junction',
//   {
// 	chat_id: integer('chat_id'),
// 	topic_id: integer('user_id'),
//   },
// )

// export type TNewPartJunct = InferModel<typeof newRelTopicSchema, 'insert'>