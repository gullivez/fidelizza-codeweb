import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { account } from './account.schema';
import { restaurants } from './restaurant.schema';

export const integration = pgTable('integration', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => account.id),
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurants.id),
  provider: text('provider').notNull().default('anota_ai'),
  credentialsEnc: text('credentials_enc').notNull(),
  syncTime1: text('sync_time_1').notNull().default('03:00'),
  syncTime2: text('sync_time_2'),
  status: text('status')
    .notNull()
    .default('active')
    .$type<'active' | 'inactive' | 'error'>(),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  lastError: text('last_error'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Integration = typeof integration.$inferSelect;
export type NewIntegration = typeof integration.$inferInsert;
