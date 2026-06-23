/**
 * Backfill de conversões (Sprint 5 — Defeito 3).
 *
 * Varre todo restaurant_order sem conversion correspondente e roda a mesma
 * lógica de atribuição last-touch do ConversionAttributionProcessor (reutilizada
 * diretamente — sem duplicar a query). Idempotente: ON CONFLICT (restaurant_order_id)
 * DO NOTHING já garante que rodar duas vezes não duplica.
 *
 * Execução:
 *   npm run backfill:conversions
 *
 * Usa DATABASE_MIGRATION_URL (superuser) para contornar RLS ao varrer todos os tenants.
 */
import 'dotenv/config';
import postgres from 'postgres';
import type { Job } from 'bullmq';
import type { Sql } from 'postgres';
import { ConversionAttributionProcessor } from '../../queues/processors/conversion-attribution.processor';
import type { DatabaseService } from '../database.service';

interface PendingOrderRow {
  restaurant_order_id: string;
  account_id: string;
  restaurant_id: string;
}

async function run() {
  const url = process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL;
  if (!url)
    throw new Error('DATABASE_MIGRATION_URL ou DATABASE_URL não configurado');

  const sql = postgres(url);

  try {
    // Reaproveita o mesmo runInTenantContext (mesma forma de set_config) usado pelo
    // DatabaseService real, sem precisar do ConfigModule/Nest fora do bootstrap da app.
    const fakeDb = {
      runInTenantContext: async <T>(
        accountId: string,
        fn: (tx: Sql) => Promise<T>,
      ): Promise<T> => {
        return sql.begin(async (tx) => {
          await tx`SELECT set_config('app.account_id', ${accountId}, true)`;
          return fn(tx as unknown as Sql);
        }) as Promise<T>;
      },
    };

    const processor = new ConversionAttributionProcessor(
      fakeDb as unknown as DatabaseService,
    );

    const pending = await sql<PendingOrderRow[]>`
      SELECT ro.id AS restaurant_order_id, ro.account_id, ro.restaurant_id
      FROM restaurant_order ro
      LEFT JOIN conversion c ON c.restaurant_order_id = ro.id
      WHERE c.id IS NULL
    `;

    const [{ count: beforeCount }] = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM conversion
    `;

    for (const row of pending) {
      await processor.process({
        data: {
          restaurantOrderId: row.restaurant_order_id,
          accountId: row.account_id,
          restaurantId: row.restaurant_id,
        },
      } as Job<{
        restaurantOrderId: string;
        accountId: string;
        restaurantId: string;
      }>);
    }

    const [{ count: afterCount }] = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM conversion
    `;
    const created = afterCount - beforeCount;

    console.log(
      `${pending.length} pedidos varridos, ${created} conversões criadas`,
    );
  } finally {
    await sql.end();
  }
}

run()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error('Erro no backfill de conversões:', err);
    process.exit(1);
  });
