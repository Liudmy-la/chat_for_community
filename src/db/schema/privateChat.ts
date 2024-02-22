// import { InferModel } from "drizzle-orm";
// import { pgTable, varchar, uuid } from "drizzle-orm/pg-core";

// export const privateChatSchema = pgTable("privateChatSchema", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   userIdOne: varchar("user_id_one").notNull(),
//   userIdSecond: varchar("user_id_second").notNull(),
//   messageIds: varchar("message_ids").array().default([]),
// });

// export type TChats = InferModel<typeof privateChatSchema>;
// export type TNewPrivateChat = InferModel<typeof privateChatSchema, "insert">;