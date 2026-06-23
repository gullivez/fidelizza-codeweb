/**
 * Teste de carga no disparo de campanha — observa o comportamento real do
 * RateLimiterService (token bucket por restaurant_id no Redis) sob volume,
 * sem alterar RateLimiterService/CampaignDispatchProcessor.
 *
 * Pré-requisito: backend rodando localmente (`npm run start:dev`) com
 * Postgres/Redis up (`docker compose up`), e WHATSAPP_PROVIDER=mock no .env
 * (o script confirma isso e aborta se não for o caso).
 *
 * Execução:
 *   npx ts-node -r tsconfig-paths/register scripts/load-test-dispatch.ts
 *
 * Importante (achado de arquitetura, ver relatório final do script): o
 * rate limiter NÃO usa o mecanismo de jobs `delayed` do BullMQ. Uma campanha
 * inteira é UM job BullMQ só (CampaignDispatchProcessor, concurrency: 1) que
 * processa os N targets sequencialmente dentro de si mesmo, esperando via
 * busy-poll (setTimeout 50-150ms) quando o limite por segundo é atingido.
 * Não existem "jobs individuais por mensagem" passando por waiting/delayed —
 * a granularidade por mensagem só existe em message_log.
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import postgres from 'postgres';
import { Queue } from 'bullmq';

const API_BASE = process.env.APP_BASE_URL ?? 'http://localhost:3000';
const PASSWORD = 'Password1!';
const TARGET_COUNT = 20;
const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS = 120_000;

const ACCOUNT_SLUG = 'load-test-tenant';
const RESTAURANT_SLUG = 'load-test-restaurant';
const USER_EMAIL = 'load-test-owner@fidelizza.test';

interface SeedResult {
  accountId: string;
  restaurantId: string;
  campaignId: string;
}

function assertMockProvider(): void {
  const provider = process.env.WHATSAPP_PROVIDER;
  console.log(
    `WHATSAPP_PROVIDER = ${provider ?? '(não definido, default mock)'}`,
  );
  if (provider && provider !== 'mock') {
    throw new Error(
      `WHATSAPP_PROVIDER está como "${provider}" — este teste só pode rodar com "mock" (não disparar mensagens reais via Twilio). Ajuste o .env e reinicie o backend antes de rodar de novo.`,
    );
  }
  console.log('OK — confirmado modo mock.\n');
}

async function cleanup(seedSql: postgres.Sql): Promise<void> {
  await seedSql`DELETE FROM campaign WHERE restaurant_id IN (
    SELECT id FROM restaurants WHERE slug = ${RESTAURANT_SLUG}
  )`;
  await seedSql`DELETE FROM customer WHERE restaurant_id IN (
    SELECT id FROM restaurants WHERE slug = ${RESTAURANT_SLUG}
  )`;
  await seedSql`DELETE FROM app_user WHERE email = ${USER_EMAIL}`;
  await seedSql`DELETE FROM restaurants WHERE slug = ${RESTAURANT_SLUG}`;
  await seedSql`DELETE FROM account WHERE slug = ${ACCOUNT_SLUG}`;
}

async function seed(seedSql: postgres.Sql): Promise<SeedResult> {
  await cleanup(seedSql);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const [account] = await seedSql`
    INSERT INTO account (type, name, slug)
    VALUES ('direct', 'Load Test Tenant', ${ACCOUNT_SLUG})
    RETURNING id
  `;
  const accountId = account.id as string;

  await seedSql`
    INSERT INTO app_user (account_id, email, password_hash, name, role)
    VALUES (${accountId}, ${USER_EMAIL}, ${passwordHash}, 'Load Test Owner', 'owner')
  `;

  const [restaurant] = await seedSql`
    INSERT INTO restaurants (account_id, name, slug)
    VALUES (${accountId}, 'Load Test Restaurant', ${RESTAURANT_SLUG})
    RETURNING id
  `;
  const restaurantId = restaurant.id as string;

  for (let i = 0; i < TARGET_COUNT; i++) {
    const [customer] = await seedSql`
      INSERT INTO customer (account_id, restaurant_id, phone, name, consent_whatsapp)
      VALUES (${accountId}, ${restaurantId}, ${`+5511900${String(i).padStart(6, '0')}`}, ${`Cliente Carga ${i + 1}`}, true)
      RETURNING id
    `;
    await seedSql`
      INSERT INTO customer_segment (
        customer_id, restaurant_id, account_id, segment_name,
        recency_score, frequency_score, monetary_score, is_current
      )
      VALUES (${customer.id as string}, ${restaurantId}, ${accountId}, 'champions', 1, 1, 1, true)
    `;
  }

  const [campaign] = await seedSql`
    INSERT INTO campaign (
      account_id, restaurant_id, name, segment_name,
      template_name, content_sid, message_body, status
    )
    VALUES (
      ${accountId}, ${restaurantId}, 'Campanha Teste de Carga', 'champions',
      'load_test_template', 'HXloadtest', 'Olá {{1}}, promoção especial!', 'draft'
    )
    RETURNING id
  `;

  return { accountId, restaurantId, campaignId: campaign.id as string };
}

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login falhou: HTTP ${res.status}`);
  const body = (await res.json()) as { accessToken: string };
  return body.accessToken;
}

async function dispatchCampaign(
  token: string,
  restaurantId: string,
  campaignId: string,
  idempotencyKey: string,
): Promise<{ status: string }> {
  const res = await fetch(
    `${API_BASE}/restaurants/${restaurantId}/campaigns/${campaignId}/dispatch`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({}),
    },
  );
  if (res.status !== 202) {
    throw new Error(
      `Dispatch retornou HTTP ${res.status} (esperado 202): ${await res.text()}`,
    );
  }
  return (await res.json()) as { status: string };
}

async function monitorJob(
  queue: Queue,
  jobId: string,
): Promise<{ finalState: string; elapsedMs: number }> {
  const start = Date.now();
  console.log(
    `\nMonitorando job BullMQ "${jobId}" a cada ${POLL_INTERVAL_MS / 1000}s (até ${POLL_TIMEOUT_MS / 1000}s)...\n`,
  );

  for (;;) {
    const elapsedMs = Date.now() - start;
    const job = await queue.getJob(jobId);
    const state = job ? await job.getState() : 'not_found';
    const counts = await queue.getJobCounts();

    console.log(
      `  [+${(elapsedMs / 1000).toFixed(0)}s] job=${state} | fila: waiting=${counts.waiting} active=${counts.active} completed=${counts.completed} failed=${counts.failed} delayed=${counts.delayed}`,
    );

    if (state === 'completed' || state === 'failed') {
      return { finalState: state, elapsedMs };
    }
    if (elapsedMs >= POLL_TIMEOUT_MS) {
      return { finalState: `timeout (último estado: ${state})`, elapsedMs };
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

async function summarizeMessageLog(
  seedSql: postgres.Sql,
  campaignId: string,
): Promise<Record<string, number>> {
  const rows = await seedSql<{ status: string; count: string }[]>`
    SELECT ml.status, count(*)::text AS count
    FROM campaign_target ct
    JOIN message_log ml ON ml.campaign_target_id = ct.id
    WHERE ct.campaign_id = ${campaignId}
    GROUP BY ml.status
  `;
  const summary: Record<string, number> = {};
  for (const row of rows) summary[row.status] = Number(row.count);
  return summary;
}

async function main(): Promise<void> {
  assertMockProvider();

  const migrationUrl = process.env.DATABASE_MIGRATION_URL;
  const redisHost = process.env.REDIS_HOST ?? 'localhost';
  const redisPort = Number(process.env.REDIS_PORT ?? 6379);
  const rateLimitPerSec = Number(process.env.CAMPAIGN_RATE_LIMIT_PER_SEC ?? 10);

  if (!migrationUrl) {
    throw new Error('DATABASE_MIGRATION_URL precisa estar definido no .env');
  }

  const seedSql = postgres(migrationUrl);
  const queue = new Queue('campaign.dispatch', {
    connection: { host: redisHost, port: redisPort },
  });
  let seeded = false;

  try {
    console.log(
      `Limite configurado: ${rateLimitPerSec} msgs/seg por restaurante\n`,
    );

    console.log(
      `Seed: ${TARGET_COUNT} customers (segmento champions, consent_whatsapp=true) + 1 campanha...`,
    );
    const seedResult = await seed(seedSql);
    seeded = true;
    console.log(
      `  Restaurant: ${seedResult.restaurantId} | Campaign: ${seedResult.campaignId}`,
    );

    const token = await login(USER_EMAIL, PASSWORD);
    const idempotencyKey = randomUUID();
    const jobId = `dispatch-${idempotencyKey}`;

    console.log('\nDisparando campanha via POST .../dispatch...');
    const dispatchResult = await dispatchCampaign(
      token,
      seedResult.restaurantId,
      seedResult.campaignId,
      idempotencyKey,
    );
    console.log(`  HTTP 202 — status retornado: ${dispatchResult.status}`);

    const { finalState, elapsedMs } = await monitorJob(queue, jobId);

    const summary = await summarizeMessageLog(seedSql, seedResult.campaignId);
    const totalLogged = Object.values(summary).reduce((a, b) => a + b, 0);
    const elapsedSec = elapsedMs / 1000;
    const ratePerMin = elapsedSec > 0 ? (totalLogged / elapsedSec) * 60 : 0;

    console.log(`\n${'='.repeat(60)}`);
    console.log('RELATÓRIO — Teste de carga no disparo de campanha');
    console.log('='.repeat(60));
    console.log(`Targets elegíveis (seed): ${TARGET_COUNT}`);
    console.log(`Mensagens registradas em message_log: ${totalLogged}`);
    for (const [status, count] of Object.entries(summary)) {
      console.log(`  - ${status}: ${count}`);
    }
    console.log(`Estado final do job BullMQ: ${finalState}`);
    console.log(`Tempo total decorrido: ${elapsedSec.toFixed(1)}s`);
    console.log(`Taxa observada: ${ratePerMin.toFixed(1)} msgs/min`);
    console.log(
      `\nO job ${finalState === 'completed' ? 'COMPLETOU sem falhar' : `terminou em estado "${finalState}"`} — ` +
        (finalState === 'completed'
          ? 'o rate limit não causou nenhuma falha de job, apenas atraso interno (busy-poll) dentro do próprio job.'
          : 'investigar — não é o comportamento esperado em modo mock.'),
    );
    console.log(
      '\nNota de arquitetura: como CampaignDispatchProcessor roda com concurrency:1 e o rate ' +
        'limiter bloqueia o job inteiro internamente (não usa BullMQ delayed), uma campanha grande ' +
        'bloqueia a fila de disparo inteira (outros restaurantes incluídos) até terminar. Isso é só ' +
        'observação — RateLimiterService/CampaignDispatchProcessor não foram alterados.',
    );

    if (finalState !== 'completed') {
      process.exitCode = 1;
    }
  } finally {
    await queue.close();
    if (seeded) {
      await cleanup(seedSql);
      console.log('\nTeardown concluído (dados de teste removidos).');
    }
    await seedSql.end();
  }
}

main().catch((err) => {
  console.error('\nErro fatal no script:', err);
  process.exit(1);
});
