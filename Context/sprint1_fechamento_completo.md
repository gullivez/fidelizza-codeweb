# 🔧🔌 Sprint 1 — Fechamento Completo (Bloqueantes + Integração Frontend)

> **Uso:** abra uma nova sessão do Claude Code (VS Code) e cole o bloco "PROMPT PARA O CLAUDE CODE" abaixo.
> Este documento unifica dois trabalhos que precisam sair **na mesma entrega e nesta ordem**:
> 1. Correção dos 2 bloqueantes de QA (segurança de backend) — *tem que vir primeiro*.
> 2. Teste de isolamento de tenant + integração do frontend real.
>
> **Commit de referência:** `524ec0f` — "Sprint 1 - Update 50%"
> **Repo:** `gullivez/fidelizza-codeweb`

---

## ⚠️ Por que a ordem importa (leitura do PMO)

O plano de integração de frontend assume que *"o backend do Sprint 1 está completo e buildando"*. **Não está.** A RLS está montada mas é letra morta (app conecta como superuser + sem `FORCE` + queries sem `account_id`). Se o frontend for integrado antes, o teste de isolamento **falha** e o critério de aceite nº 3 nunca passa.

**Sequência obrigatória:** corrigir bloqueantes → aplicar migrations + seed → escrever teste de isolamento (que agora passa) → integrar frontend → QA end-to-end.

### Decisões de PMO já tomadas (não questionar)
- **Seletor de restaurante:** frontend chama `GET /restaurants` logo após o login para popular o switcher. **Não** alterar o contrato do `/auth/login` para devolver objetos de restaurante.
- **Swagger/OpenAPI:** adiado para o Sprint 2. No Sprint 1, tipar o cliente HTTP à mão.
- **Token store:** refresh token em `localStorage`, access token em memória (módulo-level var).

---

## 📋 PROMPT PARA O CLAUDE CODE

> Cole este bloco inteiro em uma nova sessão do Claude Code no VS Code.

---

```
Você é um Engenheiro Full-Stack Sênior especializado em NestJS, segurança PostgreSQL multi-tenant e React (TanStack Start/Router/Query).

=== CONTEXTO DO PROJETO ===

Produto: Fidelizza — CRM de reativação via WhatsApp para restaurantes delivery.
Stack backend: NestJS (monólito modular) + PostgreSQL 16 + Redis + Drizzle ORM.
Stack frontend: React 19 + TanStack Start/Router/Query + Tailwind/Shadcn (já existe, hoje 100% mockado).
Repo: gullivez/fidelizza-codeweb — pastas /backend e /frontend.

Multi-tenancy: ACCOUNT (direct | agency) é a fronteira de segurança (RLS com GUC app.account_id).
RESTAURANT é o escopo operacional dentro da conta. Clientes e pedidos NUNCA cruzam restaurantes.

O Sprint 1 (Auth + Tenant + Restaurant) chegou a ~80% no backend, mas o QA REPROVOU por 2 defeitos
críticos de segurança. Além disso, o frontend (login + seletor de restaurante) ainda é mockado.
Esta entrega fecha o Sprint 1: corrige os 2 defeitos, prova o isolamento com teste automatizado,
e integra o frontend real contra a API.

=== ORDEM DE EXECUÇÃO OBRIGATÓRIA ===

NÃO comece pelo frontend. A ordem é:
FASE A (backend/segurança) → FASE B (migration + seed) → FASE C (teste de isolamento) →
FASE D (frontend) → FASE E (passo a passo de QA manual).
O teste da FASE C SÓ passa depois da FASE A. Integrar o frontend antes da FASE A esconde o vazamento.

=== DECISÕES FIXAS (não questionar) ===
- Multi-tenancy via RLS + GUC app.account_id + SET LOCAL por transação.
- runInTenantContext (DatabaseService), TenantContextService (AsyncLocalStorage) e TenantContextInterceptor
  já existem e estão CORRETOS — não reescrever.
- Autenticação JWT com refresh revogável via hash no Redis — padrão já em uso. Não alterar login() nem issueTokens().
- Seletor de restaurante no frontend é populado por uma chamada GET /restaurants logo após o login.
  NÃO alterar o contrato de resposta do /auth/login para incluir objetos de restaurante.
- Swagger/OpenAPI fica para o Sprint 2. Neste sprint, tipar o cliente HTTP do frontend à mão.
- Token store no frontend: refresh token em localStorage, access token em variável de memória (módulo-level).
- NÃO adicionar módulos, tabelas ou features além do estritamente necessário para o que está descrito.

============================================================
FASE A — CORREÇÃO DOS 2 BLOQUEANTES (backend)
============================================================

--- DEFEITO 1 — Isolamento multi-tenant silenciosamente inativo ---

PROBLEMA: a RLS está montada (policies + GUC) mas não filtra nada porque:
1. A app conecta como fidelizza (superuser no PG) → superuser ignora RLS.
2. A migration faz só ENABLE ROW LEVEL SECURITY, sem FORCE → o owner da tabela também ignora.
3. As queries de RestaurantsService não filtram account_id no WHERE → sem defesa em profundidade.

CORREÇÃO:

1. docker-compose.yml:
   - Adicionar uma role de aplicação fidelizza_app (SEM superuser, SEM BYPASSRLS), com senha vinda de
     variável de ambiente (POSTGRES_APP_PASSWORD).
   - O usuário fidelizza (superuser) continua existindo, usado SÓ para migrations/estrutura.
   - A aplicação (API e workers) passa a conectar como fidelizza_app.
   - Adicionar um script SQL de init (ex.: ./docker/init/01-app-role.sql montado em
     /docker-entrypoint-initdb.d/) que:
       CREATE ROLE fidelizza_app LOGIN PASSWORD '...';   -- via env
       GRANT CONNECT ON DATABASE fidelizza TO fidelizza_app;
       GRANT USAGE ON SCHEMA public TO fidelizza_app;
       GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fidelizza_app;
       GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fidelizza_app;
       ALTER DEFAULT PRIVILEGES IN SCHEMA public
         GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO fidelizza_app;
       ALTER DEFAULT PRIVILEGES IN SCHEMA public
         GRANT USAGE, SELECT ON SEQUENCES TO fidelizza_app;
   - Confirmar que fidelizza_app NÃO tem SUPERUSER nem BYPASSRLS.

2. Configuração de conexão (env.schema.ts + .env.example):
   - DATABASE_URL → conecta como fidelizza_app (usada pela aplicação API e workers).
   - DATABASE_MIGRATION_URL → conecta como fidelizza/superuser (usada SÓ para rodar migrations).
   - Ajustar o runner de migration para usar DATABASE_MIGRATION_URL; a app e os testes usam DATABASE_URL.

3. Migration nova 0002_rls_force.sql:
   ALTER TABLE restaurants            FORCE ROW LEVEL SECURITY;
   ALTER TABLE app_user               FORCE ROW LEVEL SECURITY;
   ALTER TABLE user_restaurant_access FORCE ROW LEVEL SECURITY;

   Recriar as policies existentes adicionando WITH CHECK (impede INSERT/UPDATE gravar account_id de outra conta):
   DROP POLICY IF EXISTS tenant_isolation ON restaurants;
   CREATE POLICY tenant_isolation ON restaurants
     USING (account_id = current_setting('app.account_id', true)::uuid)
     WITH CHECK (account_id = current_setting('app.account_id', true)::uuid);
   (repetir o padrão USING + WITH CHECK para app_user e user_restaurant_access)

4. RestaurantsService — defesa em profundidade:
   Adicionar account_id explícito no WHERE de TODAS as queries (findAll, findOne, update, remove).
   Manter o runInTenantContext (as duas defesas coexistem).
   Exemplo (findAll):
     findAll() {
       const { accountId } = this.tenantContext.get();
       return this.db.runInTenantContext(accountId, (sql) => sql`
         SELECT id, name, slug, phone, status, created_at
         FROM restaurants
         WHERE account_id = ${accountId}
           AND status = 'active'
         ORDER BY name
       `);
     }
   Em findOne/update/remove, o account_id no WHERE faz com que um id de outra conta retorne vazio
   → o service deve traduzir "não encontrado" em 404 (NotFoundException), nunca 200 nem 403.

CRITÉRIO DE ACEITE DO DEFEITO 1:
- Com JWT do account A, GET /restaurants retorna APENAS restaurantes de A.
- Com JWT do account A, GET /restaurants/{id_de_B} retorna 404.
- Com JWT do account A, PATCH /restaurants/{id_de_B} e DELETE /restaurants/{id_de_B} retornam 404.
- A role fidelizza_app NÃO aparece com SUPERUSER nem BYPASSRLS (conferir via \du no psql).

--- DEFEITO 2 — refresh() degrada o access token ---

PROBLEMA: o refresh token é assinado só com { sub }. No refresh(), o novo access token herda esse
payload mínimo e perde accountId, role e allowedRestaurantIds. Após o primeiro refresh, o
TenantContextInterceptor não popula o contexto e o RestaurantAccessGuard quebra.

CORREÇÃO em auth.service.ts, método refresh() (recarregar o usuário do banco e re-emitir token íntegro):

  async refresh(refreshToken: string): Promise<LoginResponseDto> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret')!,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const stored = await this.redis.getClient().get(`refresh:${payload.sub}`);
    const incoming = this.hashToken(refreshToken);
    if (!stored || stored !== incoming) {
      throw new UnauthorizedException('Refresh token revogado');
    }

    const sql = this.db.getSql();
    const [user] = await sql<{ id: string; account_id: string; name: string; email: string; role: 'owner'|'admin'|'operator'; is_active: boolean }[]>`
      SELECT id, account_id, name, email, role, is_active
      FROM app_user WHERE id = ${payload.sub} LIMIT 1
    `;
    if (!user || !user.is_active) throw new UnauthorizedException('Usuário inativo');

    const allowedRestaurantIds = await this.resolveAllowedRestaurants(
      sql, user.id, user.account_id, user.role,
    );

    const fullPayload: JwtPayload = {
      sub: user.id,
      accountId: user.account_id,
      role: user.role,
      allowedRestaurantIds,
    };

    const { accessToken, refreshToken: newRefresh } = await this.issueTokens(user.id, fullPayload);

    return {
      accessToken,
      refreshToken: newRefresh,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, allowedRestaurantIds },
    };
  }

CRITÉRIO DE ACEITE DO DEFEITO 2:
- Login → usar access token → POST /auth/refresh → o novo access token contém accountId, role e
  allowedRestaurantIds IGUAIS ao original.
- GET /restaurants com o token pós-refresh retorna apenas os restaurantes do account correto.
- Logout após refresh invalida o novo refresh token (Redis.del funciona no token novo).

Ao final da FASE A: rodar `tsc --noEmit` no backend e garantir build limpo antes de seguir.

============================================================
FASE B — MIGRATION + SEED (pré-requisito do teste)
============================================================

- Garantir que as migrations 0001_auth_tenant.sql e 0002_rls_force.sql rodam via DATABASE_MIGRATION_URL.
- Criar um script/fixture de seed reutilizável pelo teste de integração (e documentado para uso manual)
  que insere via conexão superuser:
    - account A (slug tenant-a) e account B (slug tenant-b)
    - 1 app_user owner por conta (owner@tenant-a.com / owner@tenant-b.com, senha bcrypt conhecida)
    - 1 restaurant por conta (restaurant A em account A, restaurant B em account B)
- O seed conecta como superuser (fidelizza) de propósito, para conseguir popular as duas contas.
  A APLICAÇÃO e os TESTES de integração conectam como fidelizza_app (é isso que prova o isolamento).

============================================================
FASE C — TESTE DE ISOLAMENTO DE TENANT (automatizado)
============================================================

Arquivo novo: backend/src/restaurants/restaurants.integration.spec.ts
- Estratégia: supertest contra a aplicação NestJS REAL + banco Docker. NÃO mockar o DB.
  A app sob teste DEVE conectar como fidelizza_app (DATABASE_URL), nunca como superuser.
- beforeAll: subir app + seed (account A/B, user A/B, restaurant A/B). afterAll: teardown.
- Casos:
  1. POST /auth/login (user A) → 200, extrai tokenA. Idem user B → tokenB.
  2. GET /restaurants com tokenA → contém restaurant A e NÃO contém restaurant B.
  3. GET /restaurants com tokenB → contém restaurant B e NÃO contém restaurant A.
  4. GET /restaurants/{id_de_B} com tokenA → 404.
  5. GET /restaurants sem token → 401.
  6. (refresh) POST /auth/refresh com refresh de A → novo access token; GET /restaurants com ele
     ainda retorna só restaurantes de A.

Script no backend/package.json:
  "test:integration": "jest --config jest.config.js --testPathPattern=integration"

CI: em .github/workflows/ci.yml (já tem serviços docker postgres + redis), adicionar um step
test:integration após o step de testes unitários, com as env de DATABASE_URL (fidelizza_app),
DATABASE_MIGRATION_URL (fidelizza) e POSTGRES_APP_PASSWORD configuradas.

============================================================
FASE D — INTEGRAÇÃO DO FRONTEND (substituir mock pela API real)
============================================================

1. frontend/.env (novo):
   VITE_API_URL=http://localhost:3000
   (o backend já tem app.enableCors() — sem CORS extra)

2. frontend/src/lib/api-client.ts (novo):
   - apiRequest<T>(path, options?): injeta Authorization: Bearer <accessToken> automaticamente.
   - getAccessToken(): lê de variável de memória (módulo-level; não persiste entre reloads).
   - getRefreshToken(): lê de localStorage. setTokens(access, refresh): grava access em memória e refresh no localStorage.
   - clearTokens(): limpa ambos.
   - Em resposta 401: chamar POST /auth/refresh com o refresh do localStorage, atualizar tokens via
     setTokens() e RETENTAR a request original uma vez. Se o refresh também falhar → clearTokens() + redirect /login.

3. frontend/src/lib/api-types.ts (novo): tipar à mão (Swagger fica p/ Sprint 2) os contratos usados:
   - LoginResponse { accessToken; refreshToken; user: { id; name; email; role; allowedRestaurantIds: string[] } }
   - Restaurant { id; name; slug; phone?; status; created_at }
   Manter ESTES tipos fiéis aos DTOs reais do backend e documentar o contrato no corpo da PR.

4. frontend/src/routes/login.tsx (modificar): trocar o mock handleSubmit por:
   const res = await apiRequest<LoginResponse>('/auth/login', { method:'POST', body: JSON.stringify({ email, password }) });
   setTokens(res.accessToken, res.refreshToken);
   const restaurants = await apiRequest<Restaurant[]>('/restaurants');   // popula o switcher
   setLayoutRestaurants(restaurants); // guardar no LayoutContext
   redirect para '/'.
   Mapeamento de erro: 401 → estado "error" (credenciais inválidas);
   403 com conta/usuário suspenso → estado "blocked".
   Substituir o gatilho atual de "blocked" (email === 'blocked@fidelizza.com') pela resposta real
   (user.status === 'suspended' ou account.status === 'suspended').

5. frontend/src/components/layout/layout-context.tsx (modificar): trocar a carga de mock-data por
   leitura do store de auth — os restaurantes vêm da chamada GET /restaurants feita no login.
   RestaurantSwitcher.tsx já consome o LayoutContext; não muda a lógica se o contexto for corrigido.

6. frontend/src/routes/_authenticated.tsx (novo, layout route do TanStack Router):
   - beforeLoad: se getAccessToken() === null → throw redirect({ to: '/login' }).
   - Mover as rotas protegidas para o grupo _authenticated/ (convenção do TanStack Router).

============================================================
FASE E — PASSO A PASSO DE QA MANUAL (documentar no final da entrega)
============================================================
Mostrar os comandos exatos para:
- aplicar migrations 0001 + 0002 (via DATABASE_MIGRATION_URL),
- rodar o seed dos 2 accounts + 2 restaurantes,
- os curl de login, isolamento (GET /restaurants e GET /restaurants/{id_de_B}), refresh e sem-token,
- e como verificar o login + switcher pelo frontend rodando.

=== ENTREGÁVEIS ===
Backend:
1. docker-compose.yml (role fidelizza_app + script de init SQL)
2. docker/init/01-app-role.sql (criação da role restrita + grants)
3. .env.example (DATABASE_URL=fidelizza_app, DATABASE_MIGRATION_URL=fidelizza, POSTGRES_APP_PASSWORD)
4. env.schema.ts ajustado (DATABASE_URL + DATABASE_MIGRATION_URL)
5. migration 0002_rls_force.sql (FORCE + WITH CHECK nas 3 tabelas)
6. src/restaurants/restaurants.service.ts (account_id explícito em todas as queries; 404 cross-tenant)
7. src/auth/auth.service.ts (refresh() corrigido)
8. src/restaurants/restaurants.integration.spec.ts (teste de isolamento)
9. backend/package.json (script test:integration)
10. .github/workflows/ci.yml (step test:integration)
11. seed script/fixture reutilizável
Frontend:
12. frontend/.env
13. frontend/src/lib/api-client.ts
14. frontend/src/lib/api-types.ts
15. frontend/src/routes/login.tsx (integrado)
16. frontend/src/components/layout/layout-context.tsx (dados reais)
17. frontend/src/routes/_authenticated.tsx (proteção de rota)

=== REGRAS CRÍTICAS ===
- Respeitar a ORDEM A→B→C→D→E. Não integrar frontend antes de a FASE C passar.
- Não criar módulos novos, tabelas novas (além da migration 0002) nem features.
- Não alterar runInTenantContext, TenantContextService, os interceptors, login() nem issueTokens().
- A aplicação e os testes conectam como fidelizza_app; só migrations/seed usam superuser.
- Toda query de dados de tenant DEVE ter account_id no WHERE (defesa em profundidade), além da RLS.
- tsc --noEmit limpo no backend e build do frontend sem erro antes de entregar.
- NÃO usar <form> HTML em componentes React; usar onClick/onChange.
```

---

## 🧪 Critérios de aceite do Sprint 1 (QA do usuário — todos devem passar)

**Segurança / backend**
1. `GET /restaurants` sem token → **401**.
2. `GET /restaurants` com token da conta A → **apenas** restaurantes de A.
3. `GET /restaurants/{id_de_B}` com token de A → **404** (não 200, não 403).
4. `PATCH` / `DELETE /restaurants/{id_de_B}` com token de A → **404**.
5. Role `fidelizza_app` sem `SUPERUSER` e sem `BYPASSRLS` (conferir `\du`).
6. Pós-`refresh`: novo access token mantém `accountId` / `role` / `allowedRestaurantIds`; `GET /restaurants` segue isolado.
7. Teste `test:integration` **passa** (provando 2, 3, 4 e 6 automaticamente).

**Frontend / integração**
8. Login com usuário real → redireciona para `/` e o seletor de restaurante vem populado **do banco**.
9. Acessar rota protegida sem estar logado → redireciona para `/login`.
10. Em 401 numa request autenticada, o cliente tenta `refresh` e retenta a request transparentemente.

**Resultado:** 10/10 → QA APROVADO → avança para o Sprint 2.

---

## 📎 Pendências menores (registradas, NÃO bloqueiam o Sprint 1)

| Item | Quando |
|---|---|
| `@nestjs/swagger` + `openapi.json` + codegen de tipos no front | Sprint 2 (muitos endpoints novos) |
| Sentry (erros de produção) | Sprint 2 / hardening |
| UUID v7 (`gen_random_uuid()` → `uuid_generate_v7()`) | Sprint 2 (junto com novas migrations) |
| `AllExceptionsFilter` RFC 7807 completo (`title`/`instance`/`requestId`) | Sprint 2 |
| `userRestaurantAccess` no Drizzle sem PK/refs (drift vs. SQL) | Sprint 2 |
| Documentar o contrato `LoginResponse`/`Restaurant` na PR (até o Swagger chegar) | Esta entrega |
