ALTER TABLE "users" ALTER COLUMN "nickname" SET NOT NULL;
ALTER TABLE "users" ADD COLUMN "first_name" varchar(50);
ALTER TABLE "users" ADD COLUMN "last_name" varchar(50);
CREATE UNIQUE INDEX IF NOT EXISTS "nicknameIdx" ON "users" ("nickname");