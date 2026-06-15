import { pgTable, uuid, text, integer, numeric, timestamp } from 'drizzle-orm/pg-core';
import { account } from './account.schema';
import { restaurants } from './restaurant.schema';

export const customer = pgTable('customer', {
  id:           uuid('id').defaultRandom().primaryKey(),
  accountId:    uuid('account_id').notNull().references(() => account.id),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id),
  phone:        text('phone').notNull(),
  name:         text('name').notNull(),
  totalOrders:  integer('total_orders').notNull().default(0),
  totalSpent:   numeric('total_spent', { precision: 10, scale: 2 }).notNull().default('0'),
  avgTicket:    numeric('avg_ticket', { precision: 10, scale: 2 }).notNull().default('0'),
  lastOrderAt:  timestamp('last_order_at', { withTimezone: true }),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Customer    = typeof customer.$inferSelect;
export type NewCustomer = typeof customer.$inferInsert;
