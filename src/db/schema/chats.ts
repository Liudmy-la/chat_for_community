import { InferModel } from "drizzle-orm";
import { mysqlTable, char, uniqueIndex, int, varchar, boolean } from "drizzle-orm/mysql-core";

const defaultPhoto = "https://i.ibb.co/XD7Hhhs/avatar-Bot.png";

export const chatSchema = mysqlTable(
	"chats",
	{
		chat_id: int('chat_id').notNull().primaryKey().autoincrement(),
		is_private: boolean('is_private').notNull(),
		admin_id: int('admin_id'),
		chat_name: char('chat_name', { length: 50 }),
		description: varchar('description', { length: 2000 }),
		chat_avatar: varchar('chat_avatar', { length: 255 }).default(defaultPhoto),
	},
	(table) => ({
		nameIndex: uniqueIndex("nameIdx").on(table.chat_name),
	})
);

export type TChats = InferModel<typeof chatSchema>;
export type TNewChats = InferModel<typeof chatSchema, "insert">;



// import { InferModel } from "drizzle-orm";
// import { pgTable, varchar, char, uuid, uniqueIndex, serial, integer } from "drizzle-orm/pg-core";

// const defaultPhoto = "https://i.ibb.co/XD7Hhhs/avatar-Bot.png";

// export const chatSchema = pgTable(
// 	"chats",
//  	{
// 		// id: uuid("id").defaultRandom().primaryKey(),
// 		chat_id: serial('chat_id').primaryKey(),
// 		is_private: char("is_private", { length: 5 }).notNull(),
// 		admin_id: integer("admin_id"),
// 		chat_name: char("chat_name", { length: 50 }),
// 		description: varchar("description"),
// 		// greetings: char("greetings"),
// 		chat_avatar: varchar("chat_avatar", { length: 255 }).default(defaultPhoto),
// 	},
// 	(table) => ({
// 		nameIndex: uniqueIndex("nameIdx").on(table.chat_name),
// 	})
// );

// export type TChats = InferModel<typeof chatSchema>;
// export type TNewChats = InferModel<typeof chatSchema, "insert">;