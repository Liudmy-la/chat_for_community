CREATE TABLE IF NOT EXISTS "privateChatSchema" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id_one" varchar NOT NULL,
	"user_id_second" varchar[] NOT NULL,
	"message_ids" varchar[] DEFAULT '{}'::varchar[] 
);

ALTER TABLE "chatSchema" ALTER COLUMN "avatar" SET DEFAULT 'https://i.ibb.co/XD7Hhhs/avatar-Bot.png';
ALTER TABLE "users" ALTER COLUMN "avatar" SET DEFAULT 'https://i.ibb.co/tYmqgt9/avatar.png';