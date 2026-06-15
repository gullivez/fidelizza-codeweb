import { pgTable, uuid, text, integer, numeric, timestamp } from 'drizzle-orm/pg-core';
import { account } from './account.schema';
import { restaurants } from './restaurant.schema';
import { customer } from './customer.schema';

export const restaurantOrder = pgTable('restaurant_order', {
  id:           uuid('id').defaultRandom().primaryKey(),
  accountId:    uuid('account_id').notNull().references(() => account.id),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id),
  customerId:   uuid('customer_id').notNull().references(() => customer.id),
  externalId:   text('external_id').notNull(),
  status:       text('status').notNull().default('pending'),
  totalAmount:  numeric('total_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  orderedAt:    timestamp('ordered_at', { withTimezone: true }).notNull(),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderItem = pgTable('order_item', {
  id:         uuid('id').defaultRandom().primaryKey(),
  orderId:    uuid('order_id').notNull().references(() => restaurantOrder.id),
  externalId: text('external_id'),
  name:       text('name').notNull(),
  quantity:   integer('quantity').notNull().default(1),
  unitPrice:  numeric('unit_price', { precision: 10, scale: 2 }).notNull().default('0'),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull().default('0'),
});

export type RestaurantOrder    = typeof restaurantOrder.$inferSelect;
export type NewRestaurantOrder = typeof restaurantOrder.$inferInsert;

export type OrderItem    = typeof orderItem.$inferSelect;
export type NewOrderItem = typeof orderItem.$inferInsert;
