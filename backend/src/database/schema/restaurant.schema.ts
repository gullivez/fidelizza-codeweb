import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

export const restaurants = pgTable(
  'restaurants',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    name: varchar('name', {
      length: 255,
    }).notNull(),

    slug: varchar('slug', {
      length: 100,
    }).notNull(),

    phone: varchar('phone', {
      length: 20,
    }),

    createdAt: timestamp(
      'created_at',
    ).defaultNow(),

    updatedAt: timestamp(
      'updated_at',
    ).defaultNow(),
  },
);