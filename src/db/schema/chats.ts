import { InferModel } from "drizzle-orm";
import { pgTable, varchar, uuid, uniqueIndex } from "drizzle-orm/pg-core";

const defaultPhoto = "https://i.ibb.co/XD7Hhhs/avatar-Bot.png";

export const chatSchema = pgTable(
  "chatSchema",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: varchar("admin_id").array().notNull().default([]),
    name: varchar("name", { length: 50 }).notNull(),
    avatar: varchar("avatar", { length: 255 }).default(defaultPhoto),
    description: varchar("description", { length: 255 }).notNull(),
    userIds: varchar("user_ids").array().default([]),
    messageIds: varchar("message_ids").array().default([]),
  },
  (table) => ({
    nameIndex: uniqueIndex("nameIdx").on(table.name),
  })
);

export type TChats = InferModel<typeof chatSchema>;
export type TNewChats = InferModel<typeof chatSchema, "insert">;


// chat_id - INT
// is_private - char
// chat_name - char
// description - varchar
// greetings - char
// chat_avatar - varchar
// admin_id - INT