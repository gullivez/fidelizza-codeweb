/**
 * Teste de isolamento de tenant para o módulo de restaurantes.
 * O app conecta via DATABASE_URL (fidelizza_app, sem BYPASSRLS).
 * O seed conecta via DATABASE_MIGRATION_URL (superuser) para popular 2 contas isoladas.
 *
 * Executar: npm run test:integration
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { AppModule } from '../app.module';
import {
  seedTenantIsolation,
  teardownTenantIsolation,
  type SeedResult,
} from '../database/seeds/tenant-isolation.seed';

describe('Tenant Isolation — /restaurants', () => {
  let app: INestApplication;
  let seed: SeedResult;
  let tokenA: string;
  let refreshTokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    seed = await seedTenantIsolation();

    app = await NestFactory.create(AppModule, { logger: false });
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  }, 30_000);

  afterAll(async () => {
    await app.close();
    await teardownTenantIsolation();
  }, 15_000);

  // ── 1. Login de ambos os tenants ────────────────────────────────────────────
  it('1. Login tenant A retorna 200 + accessToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: seed.userAEmail, password: seed.password })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    tokenA = res.body.accessToken as string;
    refreshTokenA = res.body.refreshToken as string;
  });

  it('1b. Login tenant B retorna 200 + accessToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: seed.userBEmail, password: seed.password })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    tokenB = res.body.accessToken as string;
  });

  // ── 2. Tenant A vê apenas seus restaurantes ──────────────────────────────────
  it('2. GET /restaurants (token A) → inclui Restaurant A, NÃO inclui Restaurant B', async () => {
    const res = await request(app.getHttpServer())
      .get('/restaurants')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    const ids = (res.body as { id: string }[]).map((r) => r.id);
    expect(ids).toContain(seed.restaurantAId);
    expect(ids).not.toContain(seed.restaurantBId);
  });

  // ── 3. Tenant B vê apenas seus restaurantes ──────────────────────────────────
  it('3. GET /restaurants (token B) → inclui Restaurant B, NÃO inclui Restaurant A', async () => {
    const res = await request(app.getHttpServer())
      .get('/restaurants')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);

    const ids = (res.body as { id: string }[]).map((r) => r.id);
    expect(ids).toContain(seed.restaurantBId);
    expect(ids).not.toContain(seed.restaurantAId);
  });

  // ── 4. Cross-tenant por ID retorna 404 ───────────────────────────────────────
  it('4. GET /restaurants/{id_de_B} com token A → 404', async () => {
    await request(app.getHttpServer())
      .get(`/restaurants/${seed.restaurantBId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);
  });

  // ── 5. Sem token → 401 ───────────────────────────────────────────────────────
  it('5. GET /restaurants sem token → 401', async () => {
    await request(app.getHttpServer())
      .get('/restaurants')
      .expect(401);
  });

  // ── 6. Refresh mantém isolamento ─────────────────────────────────────────────
  it('6. POST /auth/refresh (token A) → novo token → GET /restaurants ainda retorna só A', async () => {
    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: refreshTokenA })
      .expect(200);

    const newAccessToken = refreshRes.body.accessToken as string;
    expect(newAccessToken).toBeDefined();
    expect(refreshRes.body.user.allowedRestaurantIds).toBeDefined();

    const res = await request(app.getHttpServer())
      .get('/restaurants')
      .set('Authorization', `Bearer ${newAccessToken}`)
      .expect(200);

    const ids = (res.body as { id: string }[]).map((r) => r.id);
    expect(ids).toContain(seed.restaurantAId);
    expect(ids).not.toContain(seed.restaurantBId);
  });
});
