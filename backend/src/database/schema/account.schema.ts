import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const account = pgTable('account', {
  id:        uuid('id').defaultRandom().primaryKey(),
  type:      text('type').notNull().$type<'direct' | 'agency'>(),
  name:      text('name').notNull(),
  slug:      text('slug').notNull().unique(),
  status:    text('status').notNull().default('active')
               .$type<'active' | 'suspended' | 'cancelled'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Account    = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
