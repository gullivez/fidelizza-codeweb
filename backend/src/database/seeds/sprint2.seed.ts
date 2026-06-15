/**
 * Seed do Sprint 2: integration, customers e orders para o tenant-a.
 * Requer que o seed de tenant-isolation já tenha rodado (tenant-a / restaurant-a devem existir).
 *
 * Execução:
 *   npx ts-node -r tsconfig-paths/register src/database/seeds/sprint2.seed.ts
 *
 * Usa DATABASE_MIGRATION_URL (superuser) para contornar RLS.
 */
import * as dotenv from 'dotenv';
dotenv.config();

import postgres from 'postgres';

export interface Sprint2SeedResult {
  integrationId: string;
  customerAId: string;
  customerBId: string;
  orderIds: string[];
}

const AES_PLACEHOLDER_CREDS =
  // Credenciais mock encriptadas com AES_SECRET = 'placeholder-secret-key-32-chars!'
  // Valor gerado fora do banco — apenas para seed; o serviço real usa AES_SECRET do env.
  '__mock__:clientId=mock-client-id;clientSecret=mock-secret';

export async function seedSprint2(): Promise<Sprint2SeedResult> {
  const url = process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL!;
  const sql = postgres(url);

  try {
    // Buscar restaurant-a
    const [restaurant] = await sql`
      SELECT r.id, r.account_id
      FROM restaurants r
      WHERE r.slug = 'restaurant-a'
      LIMIT 1
    `;
    if (!restaurant) throw new Error('restaurant-a não encontrado — rode o tenant-isolation seed primeiro');

    const restaurantId = restaurant['id'] as string;
    const accountId = restaurant['account_id'] as string;

    // Limpar seed anterior (idempotente)
    await sql.begin(async (tx) => {
      await tx`DELETE FROM sync_log WHERE integration_id IN (
        SELECT id FROM integration WHERE restaurant_id = ${restaurantId}
      )`;
      await tx`DELETE FROM order_item WHERE order_id IN (
        SELECT id FROM restaurant_order WHERE restaurant_id = ${restaurantId}
      )`;
      await tx`DELETE FROM restaurant_order WHERE restaurant_id = ${restaurantId}`;
      await tx`DELETE FROM customer WHERE restaurant_id = ${restaurantId}`;
      await tx`DELETE FROM integration WHERE restaurant_id = ${restaurantId}`;
    });

    // Criar integration (mock)
    const [integration] = await sql`
      INSERT INTO integration (account_id, restaurant_id, provider, credentials_enc, sync_time_1, status)
      VALUES (${accountId}, ${restaurantId}, 'anota_ai', ${AES_PLACEHOLDER_CREDS}, '03:00', 'active')
      RETURNING id
    `;
    const integrationId = integration['id'] as string;

    // Criar 2 customers
    const [customerA] = await sql`
      INSERT INTO customer (account_id, restaurant_id, phone, name)
      VALUES (${accountId}, ${restaurantId}, '+5543999990001', 'João da Silva')
      RETURNING id
    `;
    const [customerB] = await sql`
      INSERT INTO customer (account_id, restaurant_id, phone, name)
      VALUES (${accountId}, ${restaurantId}, '+5543999990002', 'Maria Oliveira')
      RETURNING id
    `;
    const customerAId = customerA['id'] as string;
    const customerBId = customerB['id'] as string;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Criar 3 orders: 2 do customerA, 1 do customerB
    const [order1] = await sql`
      INSERT INTO restaurant_order
        (account_id, restaurant_id, customer_id, external_id, status, total_amount, ordered_at)
      VALUES
        (${accountId}, ${restaurantId}, ${customerAId},
         'mock-order-001', 'delivered', 58.90, ${yesterday})
      RETURNING id
    `;
    const [order2] = await sql`
      INSERT INTO restaurant_order
        (account_id, restaurant_id, customer_id, external_id, status, total_amount, ordered_at)
      VALUES
        (${accountId}, ${restaurantId}, ${customerAId},
         'mock-order-002', 'delivered', 32.50, ${today})
      RETURNING id
    `;
    const [order3] = await sql`
      INSERT INTO restaurant_order
        (account_id, restaurant_id, customer_id, external_id, status, total_amount, ordered_at)
      VALUES
        (${accountId}, ${restaurantId}, ${customerBId},
         'mock-order-003', 'delivered', 45.00, ${today})
      RETURNING id
    `;

    // Inserir itens nos pedidos
    await sql`
      INSERT INTO order_item (order_id, name, quantity, unit_price, total_price)
      VALUES
        (${order1['id']}, 'X-Burguer', 2, 22.00, 44.00),
        (${order1['id']}, 'Suco Laranja', 1, 14.90, 14.90),
        (${order2['id']}, 'Combo Frango', 1, 32.50, 32.50),
        (${order3['id']}, 'Pizza Mussarela M', 1, 45.00, 45.00)
    `;

    // Atualizar agregados dos customers
    await sql`
      UPDATE customer SET
        total_orders  = 2,
        total_spent   = 91.40,
        avg_ticket    = 45.70,
        last_order_at = ${today}
      WHERE id = ${customerAId}
    `;
    await sql`
      UPDATE customer SET
        total_orders  = 1,
        total_spent   = 45.00,
        avg_ticket    = 45.00,
        last_order_at = ${today}
      WHERE id = ${customerBId}
    `;

    await sql.end();

    return {
      integrationId,
      customerAId,
      customerBId,
      orderIds: [order1['id'] as string, order2['id'] as string, order3['id'] as string],
    };
  } catch (err) {
    await sql.end();
    throw err;
  }
}

if (require.main === module) {
  seedSprint2()
    .then((result) => {
      console.log('Sprint 2 seed concluído:');
      console.log(`  Integration: ${result.integrationId}`);
      console.log(`  Customer A (João): ${result.customerAId}`);
      console.log(`  Customer B (Maria): ${result.customerBId}`);
      console.log(`  Orders: ${result.orderIds.join(', ')}`);
    })
    .catch((err) => {
      console.error('Erro no seed:', err);
      process.exit(1);
    });
}
