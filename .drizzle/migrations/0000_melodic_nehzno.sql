CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(50) NOT NULL,
	"password" varchar(50) NOT NULL,
	"nickname" varchar(50),
	"token" varchar,
	"created_at" varchar
);

CREATE UNIQUE INDEX IF NOT EXISTS "emailIdx" ON "users" ("email");