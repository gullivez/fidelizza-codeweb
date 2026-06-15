/**
 * Seed de isolamento de tenant.
 * Conecta como superuser (DATABASE_MIGRATION_URL) para inserir dados em 2 contas separadas.
 * Usado pelo teste de integração e pode ser executado manualmente:
 *   npx ts-node -r tsconfig-paths/register src/database/seeds/tenant-isolation.seed.ts
 */
import * as dotenv from 'dotenv';
dotenv.config();

import * as bcrypt from 'bcrypt';
import postgres from 'postgres';

export interface SeedResult {
  accountAId: string;
  accountBId: string;
  restaurantAId: string;
  restaurantBId: string;
  userAEmail: string;
  userBEmail: string;
  password: string;
}

export async function seedTenantIsolation(): Promise<SeedResult> {
  const url = process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL!;
  const sql = postgres(url);

  const password = 'Password1!';
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await sql.begin(async (tx) => {
      // Limpar dados de seed anteriores (idempotente)
      await tx`DELETE FROM user_restaurant_access WHERE user_id IN (
        SELECT id FROM app_user WHERE email IN ('owner@tenant-a.com', 'owner@tenant-b.com')
      )`;
      await tx`DELETE FROM app_user WHERE email IN ('owner@tenant-a.com', 'owner@tenant-b.com')`;
      await tx`DELETE FROM restaurants WHERE slug IN ('restaurant-a', 'restaurant-b')`;
      await tx`DELETE FROM account WHERE slug IN ('tenant-a', 'tenant-b')`;
    });

    const [accountA] = await sql`
      INSERT INTO account (type, name, slug)
      VALUES ('direct', 'Tenant A', 'tenant-a')
      RETURNING id
    `;
    const [accountB] = await sql`
      INSERT INTO account (type, name, slug)
      VALUES ('direct', 'Tenant B', 'tenant-b')
      RETURNING id
    `;

    await sql`
      INSERT INTO app_user (account_id, email, password_hash, name, role)
      VALUES (${accountA.id as string}, 'owner@tenant-a.com', ${passwordHash}, 'Owner A', 'owner')
    `;
    await sql`
      INSERT INTO app_user (account_id, email, password_hash, name, role)
      VALUES (${accountB.id as string}, 'owner@tenant-b.com', ${passwordHash}, 'Owner B', 'owner')
    `;

    const [restaurantA] = await sql`
      INSERT INTO restaurants (account_id, name, slug)
      VALUES (${accountA.id as string}, 'Restaurant A', 'restaurant-a')
      RETURNING id
    `;
    const [restaurantB] = await sql`
      INSERT INTO restaurants (account_id, name, slug)
      VALUES (${accountB.id as string}, 'Restaurant B', 'restaurant-b')
      RETURNING id
    `;

    await sql.end();

    return {
      accountAId: accountA.id as string,
      accountBId: accountB.id as string,
      restaurantAId: restaurantA.id as string,
      restaurantBId: restaurantB.id as string,
      userAEmail: 'owner@tenant-a.com',
      userBEmail: 'owner@tenant-b.com',
      password,
    };
  } catch (err) {
    await sql.end();
    throw err;
  }
}

export async function teardownTenantIsolation(): Promise<void> {
  const url = process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL!;
  const sql = postgres(url);
  try {
    await sql.begin(async (tx) => {
      await tx`DELETE FROM user_restaurant_access WHERE user_id IN (
        SELECT id FROM app_user WHERE email IN ('owner@tenant-a.com', 'owner@tenant-b.com')
      )`;
      await tx`DELETE FROM app_user WHERE email IN ('owner@tenant-a.com', 'owner@tenant-b.com')`;
      await tx`DELETE FROM restaurants WHERE slug IN ('restaurant-a', 'restaurant-b')`;
      await tx`DELETE FROM account WHERE slug IN ('tenant-a', 'tenant-b')`;
    });
  } finally {
    await sql.end();
  }
}

// Execução direta via ts-node
if (require.main === module) {
  seedTenantIsolation()
    .then((result) => {
      console.log('Seed concluído:');
      console.log(
        `  Account A: ${result.accountAId} | User: ${result.userAEmail}`,
      );
      console.log(
        `  Account B: ${result.accountBId} | User: ${result.userBEmail}`,
      );
      console.log(`  Restaurant A: ${result.restaurantAId}`);
      console.log(`  Restaurant B: ${result.restaurantBId}`);
      console.log(`  Senha: ${result.password}`);
    })
    .catch((err) => {
      console.error('Erro no seed:', err);
      process.exit(1);
    });
}
