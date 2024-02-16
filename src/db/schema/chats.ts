import { InferModel } from "drizzle-orm";
import { pgTable, varchar, char, uuid, uniqueIndex, serial, integer } from "drizzle-orm/pg-core";

const defaultPhoto = "https://i.ibb.co/XD7Hhhs/avatar-Bot.png";

export const chatSchema = pgTable(
	"chats",
 	{
		// id: uuid("id").defaultRandom().primaryKey(),
		chat_id: serial('chat_id').primaryKey(),
		is_private: char("is_private", { length: 5 }).notNull(),
		admin_id: integer("admin_id"),
		name: char("name", { length: 50 }),
		description: varchar("description"),
		// greetings: char("greetings"),
		avatar: varchar("avatar", { length: 255 }).default(defaultPhoto),
	},
	(table) => ({
		nameIndex: uniqueIndex("nameIdx").on(table.name),
	})
);

export type TChats = InferModel<typeof chatSchema>;
export type TNewChats = InferModel<typeof chatSchema, "insert">;