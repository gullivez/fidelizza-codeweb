import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { account } from './account.schema';

export const restaurants = pgTable('restaurants', {
  id:        uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id').references(() => account.id),
  name:      varchar('name', { length: 255 }).notNull(),
  slug:      varchar('slug', { length: 100 }).notNull(),
  phone:     varchar('phone', { length: 20 }),
  status:    text('status').notNull().default('active').$type<'active' | 'inactive'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type Restaurant    = typeof restaurants.$inferSelect;
export type NewRestaurant = typeof restaurants.$inferInsert;
