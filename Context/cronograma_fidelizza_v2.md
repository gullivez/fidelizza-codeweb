# 🗓️ Cronograma de Desenvolvimento — Fidelizza (v2.1)

> Reestruturação do `cronograma_mvp_fidelizza.md`, **reconciliada com o código real** do repositório `gullivez/fidelizza-codeweb`. Mudanças desta versão:
> 1. **Estado atual corrigido** — os checkboxes do cronograma original estavam inflados; o código está bem antes do declarado.
> 2. **Integração Backend↔Frontend** explícita em cada sprint (faltava no original).
> 3. **Portão de QA** ao fim de cada sprint — validação manual feita por você; falhou → volta para o Executor.
> 4. **WhatsApp** migrado de Z-API para **API oficial Meta (Cloud API via BSP)**.
> 5. **Sprint de Fundação re-sequenciado:** o alicerce multi-tenant + RLS precisa existir antes de Auth/Tenant/Restaurant.
>
> Fonte de verdade única de execução. Detalhe de produto/arquitetura: ver `contexto_fidelizza.md`.

---

## 👥 Equipe e fluxo

| Papel | Quem |
|---|---|
| Stakeholder / Decisão / QA | **Você** |
| Executor (desenvolvimento) | **Claude Code (VS Code)** |
| PMO / Apoio à decisão | **Claude (PMO)** |

**Ciclo de cada sprint:** PMO desenha + gera prompts → você aprova → Claude Code executa → **integração BE↔FE** → **QA seu** → PMO revisa contra critério de aceite → ✅ avança / ❌ volta para correção.

---

## 🧭 Convenções

- `[x]` feito (confirmado no repo) · `[~]` em andamento · `[ ]` pendente.
- **🔌 Integração BE↔FE** = passo onde o frontend passa a consumir a API real (sem mock).
- **🧪 QA (você)** = validação manual contra o critério de aceite. Resultado: **PASSOU** ou **lista de defeitos** → backlog de correção antes de avançar.

---

## 📍 Estado atual (reconciliado com o commit `524ec0f` — "Sprint 1 - Update 50%")

| Sprint | Status real |
|---|---|
| 0 — Fundação | ✅ **Concluído na prática** (ver ressalva de RLS abaixo) |
| 0.5 — Completar Fundação | ✅ **Absorvido** — multi-tenant, worker, Pino, `/health/ready` feitos; falta Sentry/Swagger/UUID v7 |
| 1 — Auth + Tenant + Restaurant | 🟡 **~80% no backend — REPROVADO no QA** por 1 defeito crítico + 1 funcional |
| 2 — Integração + Clientes + Pedidos | ⬜ A iniciar (telas de FE já esboçadas, mockadas) |
| 3 — Segmentação RFM | ⬜ A iniciar |
| 4 — Campanhas + WhatsApp oficial | ⬜ A iniciar |
| 5 — Dashboard de ROI | ⬜ A iniciar |
| 6 — Hardening + Go-live | ⬜ A iniciar |

### O que evoluiu muito (crédito devido)
Esqueleto NestJS sólido; `main.ts` com helmet + CORS + `ValidationPipe` + shutdown hooks + Pino; `main.worker.ts` presente; `nestjs-pino` com `requestId`; `/health/ready` checando PG **e** Redis (503 se degradado); `RedisService` (ioredis); migration `0001` com `account`/`app_user`/`user_restaurant_access` + `account_id` em `restaurants`; **RLS com policies + `runInTenantContext` usando `set_config` com parâmetro bindado e `SET LOCAL` por transação** (padrão correto, ADR-006); AsyncLocalStorage no `TenantContextService` + interceptor global; `JwtAuthGuard` global + `@SkipAuth`; `RestaurantAccessGuard`; `auth` completo (login/refresh/logout/me, bcrypt, refresh revogável via hash no Redis); `restaurants` CRUD ligado ao contexto de tenant; env schema já com `JWT_REFRESH_SECRET`.

### 🚦 Veredito de QA do Sprint 1: ❌ REPROVADO (2 itens bloqueantes)

**🔴 BLOQUEANTE 1 — Isolamento multi-tenant NÃO está realmente ativo.**
A RLS está montada (policies + GUC), mas é **letra morta** hoje, porque:
1. A app conecta como `fidelizza`, que no Postgres é **superuser** (definido em `docker-compose`) → superuser **ignora RLS sempre**.
2. A migration faz só `ENABLE ROW LEVEL SECURITY`, **sem `FORCE`** → mesmo se não fosse superuser, o **owner** da tabela ignora a policy.
3. As queries de `restaurants` (`findAll`/`findOne`/`update`/`remove`) **não filtram por `account_id` no WHERE** — confiam 100% na RLS.

→ **Efeito real:** `findAll` retorna restaurantes de **todas as contas**; `findOne/update/remove` acessam restaurante de **qualquer conta** por id. Vazamento entre tenants. É o ativo de segurança nº 1 do produto falhando silenciosamente.

**🔴 BLOQUEANTE 2 — `refresh()` degrada o access token.**
O refresh token é assinado só com `{ sub }`. No `refresh()`, o novo access token é re-emitido a partir desse payload mínimo → perde `accountId`, `role` e `allowedRestaurantIds`. Depois de um refresh, o contexto de tenant fica sem `accountId` e o `RestaurantAccessGuard` quebra.

### Backlog de correção (volta para o Claude Code antes de fechar o Sprint 1)
- [ ] Criar **role de aplicação dedicada** (sem SUPERUSER, sem BYPASSRLS); migrations rodam como owner, app conecta com a role restrita (novo `DATABASE_URL` da app)
- [ ] Adicionar `FORCE ROW LEVEL SECURITY` em `restaurants`/`app_user`/`user_restaurant_access`
- [ ] Adicionar `WITH CHECK` nas policies (impede INSERT/UPDATE gravar `account_id` de outra conta)
- [ ] Defesa em profundidade: incluir `account_id` explícito no WHERE das queries (não confiar só na RLS)
- [ ] Corrigir `refresh()`: recarregar o usuário (ou guardar claims) e re-emitir access token **completo** (`accountId`/`role`/`allowedRestaurantIds`)
- [ ] **Teste automatizado de isolamento** (2 accounts) como parte do critério de aceite

### Pendências menores (não bloqueiam, registrar)
- [ ] Sentry ausente · `@nestjs/swagger` ausente (necessário para o contrato BE↔FE da integração) · BullMQ ainda não (ok, é Sprint 2)
- [ ] UUID v4 (`gen_random_uuid`) em vez de v7 (ADR-009)
- [ ] `AllExceptionsFilter` ainda simplificado (sem `title`/`instance`/`requestId` do RFC 7807)
- [ ] Drizzle de `user_restaurant_access` sem PK/refs (drift vs. SQL da migration)
- [ ] Frontend: login ainda **mockado**, sem cliente de API (integração pendente)

---

## 🧱 SPRINT 0 + 0.5 — Fundação — ✅ CONCLUÍDO (com ressalva de RLS no backlog acima)

- [x] Esqueleto NestJS + `ConfigModule` + env (Zod, com `JWT_REFRESH_SECRET`)
- [x] `docker-compose` PG16 + Redis7 (`noeviction`)
- [x] `main.ts` (helmet/CORS/ValidationPipe/shutdown/Pino) + `main.worker.ts`
- [x] `nestjs-pino` com `requestId` · `/health/ready` (PG+Redis) · `RedisService`
- [x] Migration multi-tenant (`account`/`app_user`/`user_restaurant_access` + `account_id`) + RLS policies + `runInTenantContext` (`SET LOCAL` bindado)
- [ ] ⚠️ RLS efetivamente enforçada (ver Bloqueante 1) · Sentry · Swagger · UUID v7 · filtro RFC 7807 completo

---

## 🔐 SPRINT 1 — Auth + Tenant + Restaurant — 🟡 ~80% (REPROVADO no QA, ver backlog acima)

**Meta:** login funcionando, contexto de tenant em toda request, CRUD de restaurante, e o frontend logando contra a API real (substituindo o login mockado atual).

### Executor (Claude Code)
- [x] Deps: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`
- [x] Módulo `auth`: login, JWT access (15min) + refresh (7d, revogável via hash no Redis), logout, `/auth/me`
- [x] JWT contém: `sub`, `accountId`, `role`, `allowedRestaurantIds[]`
- [x] Módulo `tenant`: `TenantContextService` via AsyncLocalStorage + `TenantContextInterceptor` (global, após `JwtAuthGuard`)
- [x] `RestaurantAccessGuard` (valida `id`/`restaurantId` da rota ∈ `allowedRestaurantIds` para operator)
- [x] Módulo `restaurants`: CRUD ligado ao contexto de tenant
- [ ] ⚠️ Corrigir `refresh()` (re-emitir access token completo) — **bloqueante**
- [ ] ⚠️ Enforçar RLS de fato (role de app + `FORCE` + `WITH CHECK` + filtro `account_id`) — **bloqueante**
- [ ] `@ApiProperty` nos DTOs + exportar `openapi.json` (Swagger ainda ausente)

### Frontend (já existe — integrar/ajustar)
- [ ] Padronizar design tokens na tela de login existente
- [ ] Seletor de restaurante lendo restaurantes acessíveis de `/auth/me`

### 🔌 Integração BE↔FE
- [ ] Criar a camada de cliente de API (hoje só existe `example.functions.ts`)
- [ ] Gerar tipos do front a partir do `openapi.json` (`openapi-typescript`)
- [ ] **Substituir o login mockado** por `POST /auth/login` real → guarda tokens → `GET /auth/me`
- [ ] Refresh token e logout ligados à API · CORS de staging liberado para o domínio do front

### 🧪 QA (você)
- [x] `POST /auth/login` retorna JWT válido; request sem JWT retorna 401 *(estrutura pronta)*
- [ ] ❌ **JWT do tenant A nunca retorna dados do tenant B** — **FALHA HOJE** (RLS não enforçada; `findAll`/`findOne` cruzam contas)
- [ ] Refresh mantém o usuário com acesso íntegro (hoje degrada o token)
- [ ] Login pelo frontend funciona contra staging (não mais mock) e o seletor de restaurante aparece
- **Resultado:** ❌ **REPROVADO** → corrigir os 2 bloqueantes e re-QA antes do Sprint 2

---

## 📥 SPRINT 2 — Integração + Clientes + Pedidos (Elo 1 do dinheiro)

**Meta:** dados reais entrando e visíveis nas telas (que já existem, hoje mockadas).

### Executor (Claude Code)
- [ ] Migration operacional: `integration`, `customer`, `order` (particionada por mês), `order_item`, `webhook_event` — RLS + índices da Fase 4
- [ ] Módulo `integrations`: CRUD + status · `IntegrationAdapter` + `AnotaAiAdapter` (E.164)
- [ ] `POST /webhooks/anota-ai`: `@SkipAuth()` + `@RawBody()` + HMAC time-safe, resposta < 50ms
- [ ] Dedupe tripla (webhook_event + `external_id` + jobId determinístico)
- [ ] Fila `integration.ingest` + processor (upsert customer por phone, order idempotente, agregados)
- [ ] Eventos `order.created` e `customer.updated` (após commit) · OpenAPI dos novos endpoints

### Frontend (telas já existem — integrar)
- [ ] Integrações (`_app.integracoes`), Clientes lista (`_app.clientes.index`) e detalhe (`_app.clientes.$customerId`): trocar mock por API real

### 🔌 Integração BE↔FE
- [ ] Regenerar tipos do `openapi.json` · ligar estados loading/empty/error aos endpoints reais
- [ ] Tela de Integrações conecta/exibe status real; lista e perfil de clientes com dados ingeridos via webhook

### 🧪 QA (você)
- [ ] Webhook recebe, valida HMAC, persiste e responde 200 em < 50ms
- [ ] Mesmo webhook 3× cria **apenas 1** pedido (idempotência tripla)
- [ ] `Customer.phone` sempre em E.164; agregados corretos; pedido real aparece no front
- **Resultado:** ☐ PASSOU ☐ Defeitos → correção antes do Sprint 3

---

## 📊 SPRINT 3 — Segmentação RFM (Elo 2)

**Meta:** base segmentada nos 4 grupos, refletida nas telas existentes.

### Executor (Claude Code)
- [ ] Migration `segment` + `customer_segment` (snapshot histórico, `is_current`) + índices
- [ ] 4 segmentos fixos por restaurante novo (Campeões, Novos, Em Risco, Inativos)
- [ ] `RfmEngineService` (percentis dentro do restaurante) em `runInTenantContext`
- [ ] Fila `segmentation.recalculate` (concurrency 5) · `CustomerUpdatedListener` com debounce · job diário
- [ ] `GET /restaurants/:rid/segments` (contagens + %) · `POST .../recalculate`

### Frontend (integrar)
- [ ] `SegmentChips`/`CustomersTable` (já existem) exibindo o segmento real
- [ ] Distribuição por segmento consumindo `GET /segments`

### 🔌 Integração BE↔FE
- [ ] Lista de clientes mostra segmento calculado · botão "recalcular" dispara `POST /recalculate`

### 🧪 QA (você)
- [ ] ~10 clientes segmentados corretamente por percentil · recálculo < 5s para 10.000 · refletido no front
- **Resultado:** ☐ PASSOU ☐ Defeitos → correção antes do Sprint 4

---

## 📣 SPRINT 4 — Campanhas + WhatsApp oficial (Elo 3) ⚠️ MAIOR RISCO

**Meta:** criar e disparar campanha via **API oficial Meta (Cloud API/BSP)**, com controle de taxa e rastreio de status.

> **Mudança vs. original:** sai Z-API não-oficial e a maquinaria anti-ban; entra API oficial. O adapter (`messaging`) isola o BSP. Rate limit permanece, mas para respeitar **tiers e quality rating da Meta**.

### Pré-requisitos de negócio (iniciar já no Sprint 2/3 — têm prazo)
- [ ] BSP definido (Twilio / Infobip / Cloud API direto) — decisão sua 🔴
- [ ] Conta Meta Business verificada + número conectado
- [ ] **Templates (HSM) submetidos e aprovados** pela Meta
- [ ] Política de opt-in (`consent_whatsapp`)

### Executor (Claude Code)
- [ ] Migration `campaign`, `campaign_target`, `message_log` com RLS
- [ ] `WhatsAppProvider` interface + adapter do BSP (isolado)
- [ ] `RateLimiterService`: token bucket por `restaurant_id` no Redis + rampa de tier + jitter
- [ ] Suporte a templates aprovados + variáveis (`{nome}`) + checagem de **opt-in** antes do envio
- [ ] Módulo `campaigns`: criar, editar (só draft), preview, dispatch (com `Idempotency-Key` + snapshot em batch)
- [ ] Fila `campaign.dispatch` (rate-limited) · estimativa de duração ao usuário
- [ ] `POST /webhooks/{bsp}/status` + `MessageStatusProcessor` (sent/delivered/read/failed)

### Frontend (telas já existem — integrar)
- [ ] Nova Campanha (`_app.campanhas.nova` — wizard), Lista (`_app.campanhas.index`), Detalhe (`_app.campanhas.$campaignId` — funil ao vivo)

### 🔌 Integração BE↔FE
- [ ] Wizard consome segmentos reais e templates aprovados · front gera `Idempotency-Key` (UUID v4)
- [ ] Estado "sending" via **polling 5s** (sem WebSocket); funil reflete `MessageLog` real · aviso de opt-in/template

### 🧪 QA (você)
- [ ] Disparo de 100 msgs respeita rate limit · mesma `Idempotency-Key` não re-dispara
- [ ] Cliente sem opt-in não recebe · status atualiza no front · mensagem real chega num número de teste (template aprovado)
- **Resultado:** ☐ PASSOU ☐ Defeitos → correção antes do Sprint 5

---

## 💰 SPRINT 5 — Dashboard de ROI (Elo 4 — a prova)

**Meta:** dashboard com receita atribuída **real** (não mockada).

### Executor (Claude Code)
- [ ] Fila `conversion.attribution` (janela configurável) + entidade `Conversion`
- [ ] `AnalyticsService`: enviados → entregues → pedidos → R$ (`revenue_attributed` calculado no backend)
- [ ] Cache Redis com namespace + invalidação após nova conversão
- [ ] `GET /analytics/dashboard?period=7d|30d|90d` · `GET /analytics/rfm-distribution` · `GET /whatsapp/status`
- [ ] (Recomendado) custo de WhatsApp por campanha no payload → ROI líquido

### Frontend (telas já existem — integrar)
- [ ] Dashboard (`_app.index`), Configurações (`_app.configuracoes`), alert global de WhatsApp

### 🔌 Integração BE↔FE
- [ ] Dashboard consome `revenue_attributed` pronto — **front nunca calcula ROI** · funil ao vivo com dados reais · alert lê `GET /whatsapp/status`

### 🧪 QA (você)
- [ ] Receita atribuída real de ponta a ponta · número bate com conferência manual · janela respeitada
- **Resultado:** ☐ PASSOU ☐ Defeitos → correção antes do Sprint 6

---

## 🔒 SPRINT 6 — Hardening + Go-live

**Meta:** pronto para o primeiro restaurante piloto real.

### Executor (Claude Code)
- [ ] Teste de carga no disparo (rate limit/tiers) · Bull Board atrás de auth · alertas (integração, fila travada > 5min, WhatsApp desconectado)
- [ ] Backup automático PostgreSQL · doc de onboarding · domínio + SSL + CORS de produção
- [ ] Revisão de segurança: RLS com 2 tenants; usuário de banco sem BYPASSRLS · eject do Lovable se necessário

### 🔌 Integração BE↔FE (smoke E2E)
- [ ] Fluxo completo pela interface real: **Login → Conectar integração → Ver clientes → Segmentar → Criar campanha → Disparar → Ver ROI**

### 🧪 QA (você) — Go/No-Go
- [ ] Fluxo completo com restaurante de teste · nenhum vazamento entre tenants · rate limit em carga · backup testado · Bull Board saudável
- **Resultado:** ☐ GO ☐ NO-GO (lista de bloqueios)

---

## 📊 Timeline de referência (re-sequenciada)

```
Atual:   Sprint 0.5 — Completar Fundação (multi-tenant + RLS + worker + obs.)  🟡
Depois:  Sprint 1 — Auth/Tenant/Restaurant + integrar login real + QA
         Sprint 2 — Integração/Clientes/Pedidos + integrar telas + QA   ★ Elo 1
         Sprint 3 — Segmentação RFM + integrar + QA                      ★ Elo 2
         Sprint 4 — Campanhas/WhatsApp oficial + integrar + QA           ★ Elo 3 ⚠️
         Sprint 5 — Dashboard ROI + integrar + QA                        ★ Elo 4
         Sprint 6 — Hardening/Go-live + QA Go/No-Go
```
> O Sprint 0.5 adiciona tempo, mas evita retrabalho caro de segurança. Iniciar a aprovação de templates Meta (Sprint 4) já durante os Sprints 2/3.

---

## 🚨 Pendências críticas

| # | Pendência | Urgência | Responsável |
|---|---|---|---|
| 0 | **Alicerce multi-tenant + RLS ausente no código** (refazer fundação) | 🔴 Crítica | Dev (Sprint 0.5) |
| 1 | **BSP de WhatsApp** (Twilio / Infobip / Cloud API direto) | 🔴 Alta | Você + Murilo |
| 2 | **Verificação Meta Business + aprovação de templates** (prazo) | 🔴 Alta | Você / Dev |
| 3 | Integração de entrada definitiva (Anota.AI vs Cardápio Web) | 🔴 Alta | Você + Murilo |
| 4 | Webhook da integração: push ou polling? tenant via payload ou URL? | 🔴 Alta | Dev + fornecedor |
| 5 | Credenciais de dev da integração (burocracia) | 🔴 Alta | Murilo |
| 6 | **Stack do frontend diverge do plano** (TanStack Start ≠ Vite/Lovable) — confirmar se mantém | 🟠 Média | Você + Dev |
| 7 | Pricing com custo de WhatsApp embutido | 🟠 Média | Murilo |

---

## 📐 Regras de trabalho

- **Um agente por vez** nos prompts ao Executor; valide o critério de aceite **antes** de avançar.
- **Sempre forneça contexto** ao Executor (cole os arquivos já gerados quando o prompt pedir).
- **Sinais de alerta — pare e chame o PMO:** módulo/tabela novo não previsto; rate limit alterado; query sem `account_id`/`restaurant_id` no WHERE; fronteira de tenant tocada.
- **QA é inegociável:** nenhum sprint é "concluído" sem o seu aceite. Falhou → defeitos → Executor corrige → re-QA.

---

## 🎯 Definição de MVP pronto

- [ ] Fundação multi-tenant + RLS provada (isolamento entre accounts)
- [ ] Integração recebe pedidos reais
- [ ] Base segmentada em 4 grupos (RFM por percentil)
- [ ] Campanha disparada via WhatsApp oficial (template aprovado + opt-in)
- [ ] Dashboard mostra receita atribuída real (auditável)
- [ ] Fluxo completo testado com restaurante piloto real
- [ ] Nenhum dado vaza entre tenants (teste automatizado) · rate limit comprovado · backup configurado
