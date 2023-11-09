CREATE TABLE IF NOT EXISTS "chatSchema" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" varchar[] DEFAULT '{}'::varchar[] NOT NULL,
	"name" varchar(50) NOT NULL,
	"avatar" varchar(255) DEFAULT 'https://i.ibb.co/XVfDXKT/avatar-Bot.png',
	"description" varchar(255) NOT NULL,
	"user_ids" varchar[] DEFAULT '{}'::varchar[],
	"message_ids" varchar[] DEFAULT '{}'::varchar[]
);

CREATE UNIQUE INDEX IF NOT EXISTS "nameIdx" ON "chatSchema" ("name");