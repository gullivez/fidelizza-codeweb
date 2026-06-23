/**
 * Teste de isolamento de tenant para o módulo de restaurantes.
 * O app conecta via DATABASE_URL (fidelizza_app, sem BYPASSRLS).
 * O seed conecta via DATABASE_MIGRATION_URL (superuser) para popular 2 contas isoladas.
 *
 * Emails/slugs exclusivos do integration test (prefixo "it-") — não conflitam com o seed manual.
 *
 * Executar: npm run test:integration
 */
import * as dotenv from 'dotenv';
dotenv.config();

import * as bcrypt from 'bcrypt';
import type { Server } from 'http';
import postgres from 'postgres';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { AppModule } from '../app.module';

// Credenciais e slugs exclusivos do integration test — não sobrepõem o seed manual
const IT_USER_A_EMAIL = 'it-owner-a@fidelizza.test';
const IT_USER_B_EMAIL = 'it-owner-b@fidelizza.test';
const IT_ACCOUNT_SLUG_A = 'it-tenant-a';
const IT_ACCOUNT_SLUG_B = 'it-tenant-b';
const IT_RESTAURANT_SLUG_A = 'it-restaurant-a';
const IT_RESTAURANT_SLUG_B = 'it-restaurant-b';
const PASSWORD = 'Password1!';

interface InsertedIds {
  accountAId: string;
  accountBId: string;
  userAId: string;
  userBId: string;
  restaurantAId: string;
  restaurantBId: string;
}

describe('Tenant Isolation — /restaurants', () => {
  let app: INestApplication;
  let httpServer: Server;
  let ids!: InsertedIds;
  let tokenA: string;
  let refreshTokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    const migrationUrl = process.env.DATABASE_MIGRATION_URL;
    if (!migrationUrl) {
      throw new Error(
        '[beforeAll] DATABASE_MIGRATION_URL não está definido. ' +
          'Configure no .env para conectar como superuser e contornar a RLS.',
      );
    }

    const seedSql = postgres(migrationUrl);

    try {
      const passwordHash = await bcrypt.hash(PASSWORD, 10);

      // Limpeza idempotente: apenas slugs/emails exclusivos do integration test
      await seedSql.begin(async (tx) => {
        await tx`DELETE FROM user_restaurant_access
                 WHERE user_id IN (
                   SELECT id FROM app_user
                   WHERE email = ANY(${[IT_USER_A_EMAIL, IT_USER_B_EMAIL]})
                 )`;
        await tx`DELETE FROM app_user
                 WHERE email = ANY(${[IT_USER_A_EMAIL, IT_USER_B_EMAIL]})`;
        await tx`DELETE FROM restaurants
                 WHERE slug = ANY(${[IT_RESTAURANT_SLUG_A, IT_RESTAURANT_SLUG_B]})`;
        await tx`DELETE FROM account
                 WHERE slug = ANY(${[IT_ACCOUNT_SLUG_A, IT_ACCOUNT_SLUG_B]})`;
      });
      console.log('[beforeAll] Limpeza de dados anteriores concluída.');

      const [accountA] = await seedSql`
        INSERT INTO account (type, name, slug)
        VALUES ('direct', 'IT Tenant A', ${IT_ACCOUNT_SLUG_A})
        RETURNING id
      `;
      if (!accountA?.id)
        throw new Error('[beforeAll] INSERT account A não retornou id');
      console.log(`[beforeAll] account A inserido: ${accountA.id as string}`);

      const [accountB] = await seedSql`
        INSERT INTO account (type, name, slug)
        VALUES ('direct', 'IT Tenant B', ${IT_ACCOUNT_SLUG_B})
        RETURNING id
      `;
      if (!accountB?.id)
        throw new Error('[beforeAll] INSERT account B não retornou id');
      console.log(`[beforeAll] account B inserido: ${accountB.id as string}`);

      const [userA] = await seedSql`
        INSERT INTO app_user (account_id, email, password_hash, name, role)
        VALUES (${accountA.id as string}, ${IT_USER_A_EMAIL}, ${passwordHash}, 'IT Owner A', 'owner')
        RETURNING id
      `;
      if (!userA?.id)
        throw new Error('[beforeAll] INSERT app_user A não retornou id');
      console.log(`[beforeAll] user A inserido: ${userA.id as string}`);

      const [userB] = await seedSql`
        INSERT INTO app_user (account_id, email, password_hash, name, role)
        VALUES (${accountB.id as string}, ${IT_USER_B_EMAIL}, ${passwordHash}, 'IT Owner B', 'owner')
        RETURNING id
      `;
      if (!userB?.id)
        throw new Error('[beforeAll] INSERT app_user B não retornou id');
      console.log(`[beforeAll] user B inserido: ${userB.id as string}`);

      const [restaurantA] = await seedSql`
        INSERT INTO restaurants (account_id, name, slug)
        VALUES (${accountA.id as string}, 'IT Restaurant A', ${IT_RESTAURANT_SLUG_A})
        RETURNING id
      `;
      if (!restaurantA?.id)
        throw new Error('[beforeAll] INSERT restaurant A não retornou id');
      console.log(
        `[beforeAll] restaurant A inserido: ${restaurantA.id as string}`,
      );

      const [restaurantB] = await seedSql`
        INSERT INTO restaurants (account_id, name, slug)
        VALUES (${accountB.id as string}, 'IT Restaurant B', ${IT_RESTAURANT_SLUG_B})
        RETURNING id
      `;
      if (!restaurantB?.id)
        throw new Error('[beforeAll] INSERT restaurant B não retornou id');
      console.log(
        `[beforeAll] restaurant B inserido: ${restaurantB.id as string}`,
      );

      ids = {
        accountAId: accountA.id as string,
        accountBId: accountB.id as string,
        userAId: userA.id as string,
        userBId: userB.id as string,
        restaurantAId: restaurantA.id as string,
        restaurantBId: restaurantB.id as string,
      };

      console.log('[beforeAll] Seed concluído:', {
        accounts: 2,
        users: 2,
        restaurants: 2,
      });
    } catch (err) {
      console.error('[beforeAll] Seed falhou — abortando testes:', err);
      await seedSql.end();
      throw err;
    }

    await seedSql.end();

    // App conecta via DATABASE_URL (fidelizza_app, sem BYPASSRLS) — isso prova o isolamento
    app = await NestFactory.create(AppModule, { logger: false });
    app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    httpServer = app.getHttpServer() as Server;
  }, 30_000);

  afterAll(async () => {
    await app.close();

    // Apaga apenas os registros inseridos pelo beforeAll (por ID primário)
    // — não toca dados de outros seeds (ex.: owner@tenant-a.com do seed manual)
    if (!ids) return;

    const migrationUrl =
      process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL!;
    const seedSql = postgres(migrationUrl);
    try {
      await seedSql.begin(async (tx) => {
        await tx`DELETE FROM user_restaurant_access
                 WHERE user_id = ANY(${[ids.userAId, ids.userBId]})`;
        await tx`DELETE FROM app_user
                 WHERE id = ANY(${[ids.userAId, ids.userBId]})`;
        await tx`DELETE FROM restaurants
                 WHERE id = ANY(${[ids.restaurantAId, ids.restaurantBId]})`;
        await tx`DELETE FROM account
                 WHERE id = ANY(${[ids.accountAId, ids.accountBId]})`;
      });
    } finally {
      await seedSql.end();
    }
  }, 15_000);

  // ── 1. Login de ambos os tenants ────────────────────────────────────────────
  it('1. Login tenant A retorna 200 + accessToken', async () => {
    const res = await request(httpServer)
      .post('/auth/login')
      .send({ email: IT_USER_A_EMAIL, password: PASSWORD })
      .expect(200);

    const loginBodyA = res.body as {
      accessToken: string;
      refreshToken: string;
    };
    expect(loginBodyA.accessToken).toBeDefined();
    expect(loginBodyA.refreshToken).toBeDefined();
    tokenA = loginBodyA.accessToken;
    refreshTokenA = loginBodyA.refreshToken;
  });

  it('1b. Login tenant B retorna 200 + accessToken', async () => {
    const res = await request(httpServer)
      .post('/auth/login')
      .send({ email: IT_USER_B_EMAIL, password: PASSWORD })
      .expect(200);

    const loginBodyB = res.body as { accessToken: string };
    expect(loginBodyB.accessToken).toBeDefined();
    tokenB = loginBodyB.accessToken;
  });

  // ── 2. Tenant A vê apenas seus restaurantes ──────────────────────────────────
  it('2. GET /restaurants (token A) → inclui Restaurant A, NÃO inclui Restaurant B', async () => {
    const res = await request(httpServer)
      .get('/restaurants')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    const list = (res.body as { id: string }[]).map((r) => r.id);
    expect(list).toContain(ids.restaurantAId);
    expect(list).not.toContain(ids.restaurantBId);
  });

  // ── 3. Tenant B vê apenas seus restaurantes ──────────────────────────────────
  it('3. GET /restaurants (token B) → inclui Restaurant B, NÃO inclui Restaurant A', async () => {
    const res = await request(httpServer)
      .get('/restaurants')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);

    const list = (res.body as { id: string }[]).map((r) => r.id);
    expect(list).toContain(ids.restaurantBId);
    expect(list).not.toContain(ids.restaurantAId);
  });

  // ── 4. Cross-tenant por ID retorna 403 ───────────────────────────────────────
  // O RestaurantAccessGuard bloqueia antes do controller ser invocado,
  // por isso 403 é mais correto que 404 (não vaza existência do recurso).
  it('4. GET /restaurants/{id_de_B} com token A → 403', async () => {
    await request(httpServer)
      .get(`/restaurants/${ids.restaurantBId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(403);
  });

  // ── 5. Sem token → 401 ───────────────────────────────────────────────────────
  it('5. GET /restaurants sem token → 401', async () => {
    await request(httpServer).get('/restaurants').expect(401);
  });

  // ── 5b. Cross-tenant em /segments → 403 ────────────────────────────────────
  it('5b. GET /restaurants/{ridA}/segments com token B → 403', async () => {
    await request(httpServer)
      .get(`/restaurants/${ids.restaurantAId}/segments`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(403);
  });

  it('5c. POST /restaurants/{ridA}/segments/recalculate com token B → 403', async () => {
    await request(httpServer)
      .post(`/restaurants/${ids.restaurantAId}/segments/recalculate`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(403);
  });

  it('5d. GET /restaurants/{ridA}/customers com token B → 403', async () => {
    await request(httpServer)
      .get(`/restaurants/${ids.restaurantAId}/customers`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(403);
  });

  // ── 6. Refresh mantém isolamento ─────────────────────────────────────────────
  it('6. POST /auth/refresh (token A) → novo token → GET /restaurants ainda retorna só A', async () => {
    const refreshRes = await request(httpServer)
      .post('/auth/refresh')
      .send({ refreshToken: refreshTokenA })
      .expect(200);

    const refreshBody = refreshRes.body as {
      accessToken: string;
      user: { allowedRestaurantIds: string[] };
    };
    const newAccessToken = refreshBody.accessToken;
    expect(newAccessToken).toBeDefined();
    expect(refreshBody.user.allowedRestaurantIds).toBeDefined();

    const res = await request(httpServer)
      .get('/restaurants')
      .set('Authorization', `Bearer ${newAccessToken}`)
      .expect(200);

    const list = (res.body as { id: string }[]).map((r) => r.id);
    expect(list).toContain(ids.restaurantAId);
    expect(list).not.toContain(ids.restaurantBId);
  });
});
