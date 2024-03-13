import { InferModel } from "drizzle-orm";
import { mysqlTable, char, uniqueIndex, int, varchar, boolean } from "drizzle-orm/mysql-core";

const defaultPhoto = "https://i.ibb.co/XD7Hhhs/avatar-Bot.png";

export const chatSchema = mysqlTable(
	"chats",
	{
		chat_id: int('chat_id').notNull().primaryKey().autoincrement(),
		is_private: int('is_private').notNull(),
		admin_id: int('admin_id'),
		chat_name: char('chat_name', { length: 50 }).notNull(),
		description: varchar('description', { length: 2000 }),
		chat_avatar: varchar('chat_avatar', { length: 255 }).default(defaultPhoto),
	},
	(table) => ({
		nameIndex: uniqueIndex("nameIdx").on(table.chat_name),
	})
);

export type TChats = InferModel<typeof chatSchema>;
export type TNewChats = InferModel<typeof chatSchema, "insert">;