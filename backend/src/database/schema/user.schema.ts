import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { account } from './account.schema';

export const appUser = pgTable('app_user', {
  id:           uuid('id').defaultRandom().primaryKey(),
  accountId:    uuid('account_id').notNull().references(() => account.id),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name:         text('name').notNull(),
  role:         text('role').notNull().$type<'owner' | 'admin' | 'operator'>(),
  isActive:     boolean('is_active').notNull().default(true),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userRestaurantAccess = pgTable('user_restaurant_access', {
  userId:       uuid('user_id').notNull(),
  restaurantId: uuid('restaurant_id').notNull(),
});

export type AppUser    = typeof appUser.$inferSelect;
export type NewAppUser = typeof appUser.$inferInsert;
