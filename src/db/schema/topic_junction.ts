import { InferModel } from 'drizzle-orm';
import { mysqlTable, int } from 'drizzle-orm/mysql-core';

export const newRelTopicSchema = mysqlTable(
	'topic_junction',
	{
		chat_id: int('chat_id'),
		topic_id: int('user_id'),
	},
);

export type TNewPartJunct = InferModel<typeof newRelTopicSchema, 'insert'>;