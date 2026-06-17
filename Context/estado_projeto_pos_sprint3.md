# 📌 Estado do Projeto Fidelizza — Pós Sprint 3
> Snapshot consolidado ao fim da sessão de 16/06/2026. Fonte de verdade do que está pronto, o que falta e onde estamos no caminho do dinheiro.

---

## 🧭 Onde estamos no caminho do dinheiro

```
INTEGRAÇÃO → BASE DE CLIENTES → SEGMENTAÇÃO RFM → CAMPANHA WHATSAPP → PEDIDO → ROI
   ✅ S2          ✅ S2              ✅ S3             ⬜ S4 (próximo)    ⬜ S5   ⬜ S5
```

Os três primeiros elos estão fechados e validados em QA. O próximo elo — Campanha via WhatsApp — é o de **maior risco** do produto (entregabilidade é existencial) e o foco do Sprint 4.

---

## ✅ Sprints concluídos

### Sprint 0/0.5 — Fundação ✅
Esqueleto NestJS (monólito modular), `main.ts` (helmet/CORS/ValidationPipe/shutdown/Pino) + `main.worker.ts` separado, `/health/ready` (PG+Redis), `RedisService`, migration multi-tenant com RLS + `runInTenantContext` (`SET LOCAL` bindado).

### Sprint 1 — Auth + Tenant + Restaurant ✅ APROVADO
- Auth completo: JWT access (15min) + refresh (7d, revogável via hash no Redis), logout, `/auth/me`
- JWT carrega `sub`, `accountId`, `role`, `allowedRestaurantIds[]`
- `TenantContextService` (AsyncLocalStorage) + interceptor global
- `JwtAuthGuard` global + `RestaurantAccessGuard`
- CRUD de `restaurants` ligado ao contexto de tenant
- RLS efetivamente enforçada (role de app dedicada + `FORCE` + `WITH CHECK` + filtro `account_id` explícito)
- `refresh()` corrigido (re-emite access token completo)

### Sprint 2 — Integração + Clientes + Pedidos ✅ APROVADO
- Integração real **Anota.ai** validada (dois endpoints: list + get, fuso local, validação de phone)
- `IntegrationAdapter` + `AnotaAiAdapter` (E.164), flag `INTEGRATION_ADAPTER=anota_ai|mock` no env
- Migration operacional: `integration`, `customer`, `restaurant_order` (particionada), `order_item`, `webhook_event`
- Webhook com HMAC, dedupe tripla, fila `integration.ingest`
- `markSyncSuccess/Error` em `runInTenantContext(accountId)`
- Telas de Integrações e Clientes consumindo API real

### Sprint 3 — Segmentação RFM ✅ APROVADO (16/06/2026)
- Migration `0006_sprint3_segments.sql`: tabelas `segment` + `customer_segment` com FORCE RLS, policies com `WITH CHECK`, 3 índices
- `RfmEngineService`: CUME_DIST em SQL via TEMP TABLE, 3 bulk DML (close/update/insert) em transação única dentro de `runInTenantContext`
- Classificação: matriz 2×2 (recência × FM) + carve-out `total_orders = 1` → sempre `new`
- SCD-lite: histórico de transições com `is_current`, `valid_from`, `valid_to`
- Fila `segmentation.recalculate` (concurrency 5, worker-only)
- `CustomerUpdatedListener` com debounce 45s (jobId fixo `rfm:${restaurantId}`)
- Job diário (cron `0 6 * * *` = 03:00 BRT)
- `GET /restaurants/:rid/segments` + `POST .../recalculate` (202)
- `GET /restaurants/:rid/customers` expõe `segmentName` corrente
- Frontend: filtro por segmento, card de distribuição (no Dashboard), botão Recalcular com polling

**QA — 10/10 critérios aprovados.** Performance: recálculo de 10.004 clientes em 2,4s (limite era 5s). Isolamento de tenant comprovado (403 cross-tenant em ambos os endpoints).

---

## 🐛 Backlog aberto (não bloqueia)

| Item | Origem | Prioridade |
|---|---|---|
| Toast visual "Sincronizar agora" | S2 | Baixa |
| Reschedule dinâmico do cron | S2 | Baixa |
| PollingService worker-only | S2 | Baixa |
| `GET /segments` retornava 720 vs 10.004 — **corrigido durante QA do S3** | S3 | ✅ Resolvido |
| Critério 6 (debounce) não testável via SQL direto — válido por construção | S3 | Informativo |

---

## 🗄️ Banco — estado atual

- **Restaurante de teste:** `503c69ea-2df7-4e3a-973b-60266ec1e606` (Restaurant A)
- **Account de teste:** `9a628950-cd60-465b-9af0-cc0b03b1dc14`
- **Usuário:** `owner@tenant-a.com`
- **Clientes reais:** 4 (Gui TESTE +5519996666167 com 3 pedidos, João +5543999990001, Maria +5543999990002, +1 real)
- Dados de teste do S3 (seed 10k, restaurante B, conta invasora) **já removidos**

### Convenções de nomenclatura do banco (lições do QA)
Tabelas no **singular**: `customer`, `restaurant_order`, `account`, `app_user`, `segment`, `customer_segment`, `integration`, `order_item`, `webhook_event`.
**Exceção:** `restaurants` (plural).
Colunas notáveis: `restaurant_order.total_amount` (não `total`), `customer` sem `updated_at`, `account` exige `slug` + `status`, `app_user` exige `name`.

---

## 🏗️ Arquitetura (resumo)

- **Monólito modular** NestJS + Drizzle ORM + PostgreSQL 16 (RLS) + Redis + BullMQ
- **Processos separados:** `main.ts` (API) e `main.worker.ts` (workers)
- **Multi-tenancy:** `account_id` = fronteira de segurança (RLS com FORCE + WITH CHECK); `restaurant_id` = escopo operacional. Clientes/pedidos nunca cruzam restaurantes.
- **`runInTenantContext(accountId)`** obrigatório em toda operação de banco
- **Regra crítica:** todo WHERE inclui `account_id` E `restaurant_id` explícitos — não confiar só na RLS
- **Comunicação assíncrona:** EventEmitter2 → BullMQ (desacoplamento)
- **Frontend:** React 19 + TanStack Router/Query + Shadcn

### Filas BullMQ existentes
`integration.ingest` · `segmentation.recalculate` · (próxima: `campaign.dispatch`, `message.status`, `conversion.attribution`)

---

## 📈 Escalabilidade estimada (VPS 4 vCPU / 8GB)

| Dimensão | Conservador | Otimista |
|---|---|---|
| Restaurantes ativos | 50 | 200 |
| Clientes/restaurante | 50k | 150k |
| Total de clientes | 2–3M | 10M |

Gargalo real = PostgreSQL sob recálculo RFM concorrente, mitigado pela concurrency 5 do worker. Escala vertical do banco resolve até ~100 restaurantes sem mudança de código.

---

## ➡️ Próximo: Sprint 4 — Campanhas + WhatsApp (Twilio)

**BSP decidido: Twilio** (sandbox permite testar sem verificação Meta aprovada; migração futura para Cloud API direto é troca de adapter).

**Pré-requisitos de negócio em paralelo:**
- 🟡 Meta Business: WABA criada, empresa em análise (iniciado 16/06/2026)
- 🔴 Pelo menos 1 template HSM submetido e aprovado
- ✅ Conta Twilio criada (sandbox: whatsapp:+14155238886)
