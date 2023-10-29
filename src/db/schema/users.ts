import { InferModel } from 'drizzle-orm'
import { pgTable, varchar, uuid, uniqueIndex } from 'drizzle-orm/pg-core'

const defaultPhoto = 'https://i.ibb.co/nswJBHv/avatar.png'

export const newUserSchema = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 50 }).notNull(),
    password: varchar('password').notNull(),
    nickname: varchar('nickname', { length: 50 }),
    token: varchar('token'),
    createdAt: varchar('created_at'),
    avatar: varchar('avatar', { length: 255 }).default(defaultPhoto),
  },
  (table) => ({
    emailIndex: uniqueIndex('emailIdx').on(table.email), ///unique
  })
)

export type TNewUser = InferModel<typeof newUserSchema, 'insert'>
