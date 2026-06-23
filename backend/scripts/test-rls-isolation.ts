/**
 * Revisão de segurança: prova que dados de um tenant nunca vazam para outro.
 *
 * Pré-requisito: backend rodando localmente (`npm run start:dev`) com
 * Postgres/Redis up (`docker compose up`).
 *
 * Execução:
 *   npx ts-node -r tsconfig-paths/register scripts/test-rls-isolation.ts
 *
 * Partes:
 *   A — usuário de banco da aplicação não tem SUPERUSER nem BYPASSRLS.
 *   B — isolamento real entre 2 tenants via HTTP (customers, campaigns, analytics).
 *   C — FORCE ROW LEVEL SECURITY ativo nas tabelas críticas.
 *
 * Se A ou C falharem, o script para imediatamente (não roda B) — RLS quebrada
 * anula qualquer resultado de B.
 *
 * Seed 100% isolado, com slugs/emails exclusivos deste script (prefixo
 * "rls-test-") — NUNCA reutiliza tenant-isolation.seed.ts, cujos slugs
 * hardcoded ("restaurant-a"/"restaurant-b") colidem com dados reais de
 * desenvolvimento (seed principal sprint2.seed.ts usa os mesmos slugs).
 */
import * as dotenv from 'dotenv';
dotenv.config();

import * as bcrypt from 'bcrypt';
import postgres from 'postgres';

const API_BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const PASSWORD = 'Password1!';

const ACCOUNT_SLUG_A = 'rls-test-tenant-a';
const ACCOUNT_SLUG_B = 'rls-test-tenant-b';
const RESTAURANT_SLUG_A = 'rls-test-restaurant-a';
const RESTAURANT_SLUG_B = 'rls-test-restaurant-b';
const USER_EMAIL_A = 'rls-test-owner-a@fidelizza.test';
const USER_EMAIL_B = 'rls-test-owner-b@fidelizza.test';

const CRITICAL_TABLES = [
  'customer',
  'restaurant_order',
  'account',
  'app_user',
  'segment',
  'customer_segment',
  'integration',
  'campaign',
  'campaign_target',
  'message_log',
  'messaging_config',
  'conversion',
];

interface SeedResult {
  accountAId: string;
  accountBId: string;
  restaurantAId: string;
  restaurantBId: string;
}

let passed = 0;
let failed = 0;

function logResult(label: string, ok: boolean, detail?: string): void {
  if (ok) {
    passed++;
    console.log(`  PASSOU — ${label}`);
  } else {
    failed++;
    console.error(`  FALHOU — ${label}${detail ? ` (${detail})` : ''}`);
  }
}

async function checkRoleAttributes(sql: postgres.Sql): Promise<boolean> {
  console.log('\n[Parte A] Usuário de banco da aplicação');
  const rows = await sql<
    { rolname: string; rolsuper: boolean; rolbypassrls: boolean }[]
  >`SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
  const row = rows[0];
  console.log(`  Conectado como: ${row.rolname}`);
  console.log(`  rolsuper = ${row.rolsuper}`);
  console.log(`  rolbypassrls = ${row.rolbypassrls}`);

  if (row.rolsuper || row.rolbypassrls) {
    console.error(
      '  CRÍTICO: usuário da aplicação tem SUPERUSER ou BYPASSRLS — isso anula toda a proteção RLS.',
    );
    return false;
  }
  console.log('  OK — sem SUPERUSER, sem BYPASSRLS.');
  return true;
}

async function checkForceRls(sql: postgres.Sql): Promise<boolean> {
  console.log('\n[Parte C] FORCE ROW LEVEL SECURITY nas tabelas críticas');
  const rows = await sql<
    { relname: string; relrowsecurity: boolean; relforcerowsecurity: boolean }[]
  >`
    SELECT relname, relrowsecurity, relforcerowsecurity
    FROM pg_class
    WHERE relname = ANY(${CRITICAL_TABLES})
    ORDER BY relname
  `;

  let allOk = true;
  for (const table of CRITICAL_TABLES) {
    const row = rows.find((r) => r.relname === table);
    if (!row) {
      console.error(`  CRÍTICO — ${table}: tabela não encontrada`);
      allOk = false;
      continue;
    }
    const ok = row.relrowsecurity && row.relforcerowsecurity;
    console.log(
      `  ${ok ? 'OK' : 'CRÍTICO'} — ${table}: relrowsecurity=${row.relrowsecurity} relforcerowsecurity=${row.relforcerowsecurity}`,
    );
    if (!ok) allOk = false;
  }
  return allOk;
}

/** Apaga (se existir) e recria os 2 tenants de teste — slugs exclusivos deste script. */
async function seed(seedSql: postgres.Sql): Promise<SeedResult> {
  await cleanup(seedSql);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const [accountA] = await seedSql`
    INSERT INTO account (type, name, slug)
    VALUES ('direct', 'RLS Test Tenant A', ${ACCOUNT_SLUG_A})
    RETURNING id
  `;
  const [accountB] = await seedSql`
    INSERT INTO account (type, name, slug)
    VALUES ('direct', 'RLS Test Tenant B', ${ACCOUNT_SLUG_B})
    RETURNING id
  `;
  const accountAId = accountA.id as string;
  const accountBId = accountB.id as string;

  await seedSql`
    INSERT INTO app_user (account_id, email, password_hash, name, role)
    VALUES (${accountAId}, ${USER_EMAIL_A}, ${passwordHash}, 'RLS Test Owner A', 'owner')
  `;
  await seedSql`
    INSERT INTO app_user (account_id, email, password_hash, name, role)
    VALUES (${accountBId}, ${USER_EMAIL_B}, ${passwordHash}, 'RLS Test Owner B', 'owner')
  `;

  const [restaurantA] = await seedSql`
    INSERT INTO restaurants (account_id, name, slug)
    VALUES (${accountAId}, 'RLS Test Restaurant A', ${RESTAURANT_SLUG_A})
    RETURNING id
  `;
  const [restaurantB] = await seedSql`
    INSERT INTO restaurants (account_id, name, slug)
    VALUES (${accountBId}, 'RLS Test Restaurant B', ${RESTAURANT_SLUG_B})
    RETURNING id
  `;
  const restaurantAId = restaurantA.id as string;
  const restaurantBId = restaurantB.id as string;

  for (const [restaurantId, accountId, suffix] of [
    [restaurantAId, accountAId, 'a'],
    [restaurantBId, accountBId, 'b'],
  ] as const) {
    await seedSql`
      INSERT INTO customer (account_id, restaurant_id, phone, name, consent_whatsapp)
      VALUES (${accountId}, ${restaurantId}, ${`+55119999${suffix}0001`}, ${`Cliente Teste ${suffix.toUpperCase()}`}, true)
    `;
    await seedSql`
      INSERT INTO campaign (account_id, restaurant_id, name, segment_name, template_name, content_sid, message_body)
      VALUES (${accountId}, ${restaurantId}, ${`Campanha Teste ${suffix.toUpperCase()}`}, 'champions', 'rls_test_template', 'HXrlstest', 'Olá!')
    `;
  }

  return { accountAId, accountBId, restaurantAId, restaurantBId };
}

/** Idempotente — apaga só os registros com os slugs/emails exclusivos deste script. */
async function cleanup(seedSql: postgres.Sql): Promise<void> {
  await seedSql`DELETE FROM campaign WHERE restaurant_id IN (
    SELECT id FROM restaurants WHERE slug IN (${RESTAURANT_SLUG_A}, ${RESTAURANT_SLUG_B})
  )`;
  await seedSql`DELETE FROM customer WHERE restaurant_id IN (
    SELECT id FROM restaurants WHERE slug IN (${RESTAURANT_SLUG_A}, ${RESTAURANT_SLUG_B})
  )`;
  await seedSql`DELETE FROM user_restaurant_access WHERE user_id IN (
    SELECT id FROM app_user WHERE email IN (${USER_EMAIL_A}, ${USER_EMAIL_B})
  )`;
  await seedSql`DELETE FROM app_user WHERE email IN (${USER_EMAIL_A}, ${USER_EMAIL_B})`;
  await seedSql`DELETE FROM restaurants WHERE slug IN (${RESTAURANT_SLUG_A}, ${RESTAURANT_SLUG_B})`;
  await seedSql`DELETE FROM account WHERE slug IN (${ACCOUNT_SLUG_A}, ${ACCOUNT_SLUG_B})`;
}

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`Login falhou para ${email}: HTTP ${res.status}`);
  }
  const body = (await res.json()) as { accessToken: string };
  return body.accessToken;
}

async function expectStatus(
  label: string,
  path: string,
  token: string,
  expectedStatus: number,
): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  logResult(
    label,
    res.status === expectedStatus,
    `esperado ${expectedStatus}, recebido ${res.status}`,
  );
}

async function main(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  const migrationUrl = process.env.DATABASE_MIGRATION_URL;
  if (!dbUrl || !migrationUrl) {
    throw new Error(
      'DATABASE_URL e DATABASE_MIGRATION_URL precisam estar definidos no .env',
    );
  }

  const appSql = postgres(dbUrl);
  const seedSql = postgres(migrationUrl);
  let seeded = false;

  try {
    const roleOk = await checkRoleAttributes(appSql);
    const rlsOk = await checkForceRls(appSql);

    if (!roleOk || !rlsOk) {
      console.error(
        '\nAbortando — corrigir os problemas acima antes de prosseguir com o teste de isolamento (Parte B não foi executada).',
      );
      process.exitCode = 1;
      return;
    }

    console.log(
      '\n[Parte B] Seed de 2 tenants isolados (account/restaurant/customer/campaign)',
    );
    const seedResult = await seed(seedSql);
    seeded = true;
    console.log(
      `  Restaurant A: ${seedResult.restaurantAId} | Restaurant B: ${seedResult.restaurantBId}`,
    );

    console.log('\n[Parte B] Login dos dois tenants');
    const tokenA = await login(USER_EMAIL_A, PASSWORD);
    const tokenB = await login(USER_EMAIL_B, PASSWORD);
    console.log('  Login OK para os dois tenants.');

    console.log('\n[Parte B] Asserções cross-tenant');
    await expectStatus(
      'Token A → GET customers do Restaurant B → 403',
      `/restaurants/${seedResult.restaurantBId}/customers`,
      tokenA,
      403,
    );
    await expectStatus(
      'Token B → GET campaigns do Restaurant A → 403',
      `/restaurants/${seedResult.restaurantAId}/campaigns`,
      tokenB,
      403,
    );
    await expectStatus(
      'Token A → GET analytics dashboard do Restaurant B → 403',
      `/restaurants/${seedResult.restaurantBId}/analytics/dashboard?period=7d`,
      tokenA,
      403,
    );
    // Sanity check: prova que o guard libera o próprio restaurante (não bloqueia tudo).
    await expectStatus(
      'Token A → GET customers do próprio Restaurant A → 200 (sanity)',
      `/restaurants/${seedResult.restaurantAId}/customers`,
      tokenA,
      200,
    );
    await expectStatus(
      'Token B → GET campaigns do próprio Restaurant B → 200 (sanity)',
      `/restaurants/${seedResult.restaurantBId}/campaigns`,
      tokenB,
      200,
    );
  } finally {
    await appSql.end();
    if (seeded) {
      await cleanup(seedSql);
      console.log('\nTeardown concluído (dados de teste removidos).');
    }
    await seedSql.end();
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Resultado final: ${passed} passou, ${failed} falhou`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('\nErro fatal no script:', err);
  process.exit(1);
});
