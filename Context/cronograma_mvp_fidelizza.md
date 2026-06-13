# 🗓️ Cronograma de Desenvolvimento MVP — Fidelizza
**"Máquina de Reativação via WhatsApp com ROI provado"**
Versão 1.0 — Gerado pelo PMO

---
## 📋 VISÃO GERAL

| Item | Detalhe |
|---|---|
| Duração total | 9 semanas |
| Meta | MVP vendável no dia 1 |
| Stack | NestJS + React + PostgreSQL + Redis + BullMQ + Z-API |
| Modelo de trabalho | 1 dev principal + IA como acelerador |

---
## 👥 AGENTES DO PROJETO

| ID | Agente | Papel | Sprints principais |
|---|---|---|---|
| **PS** | Product Strategist | Valida escopo, requisitos, KPIs, benchmarking | Sprint 0, revisões semanais |
| **SA** | Software Architect | Decisões técnicas, ADRs, revisão de arquitetura | Sprint 0, 1, 4 |
| **UX** | UX/Frontend Designer | Design system, telas, prompts Lovable, eject | Sprint 1, 5, 6 |
| **BE** | Backend Engineer | NestJS, APIs, workers, webhooks | Sprint 1, 2, 3, 4, 5 |
| **DE** | Database & Analytics Engineer | DDL, RLS, índices, queries RFM, dashboard | Sprint 1, 3, 5 |

---
## 🛠️ SOFTWARES A INSTALAR (antes do Sprint 0)

### Máquina de desenvolvimento
```bash
# Runtimes
node --version  # >= 20 LTS  (instalar via nvm)
npm install -g @nestjs/cli

# Docker (containers locais)
docker --version        # >= 24
docker-compose --version

# Banco local (via Docker — não instalar nativo)
# PostgreSQL 16 e Redis 7 sobem via docker-compose.yml

# Frontend
npm install -g vite

# Editor
VS Code + extensões:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - REST Client (para testar APIs sem Postman)
  - Thunder Client (alternativa ao REST Client)

# Utilitários
brew install git jq httpie    # macOS
# ou equivalentes no Linux

# CLI de banco
npm install -g drizzle-kit

# Monitoramento de filas (desenvolvimento)
# Bull Board sobe junto com a API — sem instalação separada
```

### Contas e serviços externos
- **Railway ou Render** — conta gratuita para staging
- **Z-API** — conta e instância (necessária no Sprint 4)
- **Sentry** — conta free tier para erros
- **Vercel** — conta para deploy do frontend
- **Anota AI** — credenciais de desenvolvedor (iniciar processo cedo — há burocracia)

---
## 🗂️ SPRINTS DETALHADOS
### 🏗️ SPRINT 0 — Fundação (Semana 1)

**Meta:** Ambiente rodando, CI/CD, estrutura do projeto criada. Nenhuma feature ainda.

**Agentes ativos:** SA + BE + DE

**Tarefas técnicas:**
- [x] `nest new fidelizza-backend` com estrutura de pastas (monorepo simples)
- [x] `docker-compose.yml` (PostgreSQL 16 + Redis 7, `noeviction`)
- [x] Validação de env com Zod (`env.schema.ts`)
- [ ] `nestjs-pino` configurado com `requestId`
- [ ] Sentry instalado e testado
- [ ] CI/CD básico (GitHub Actions: lint + test + build)
- [ ] Deploy automático no Railway/Render (staging)
- [x] `drizzle.config.ts` e pasta `migrations/`
- [ ] `main.ts` (API) e `main.worker.ts` (workers) separados
- [ ] `AllExceptionsFilter` RFC 7807

**Critério de aceite:**
- API sobe sem erros (`GET /health` retorna 200)
- PostgreSQL e Redis conectados e validados no `/health/ready`
- Push no `main` faz deploy automático no staging

---

**🤖 PROMPT — Software Architect (Sprint 0)**
```
Você é um Software Architect Sênior especializado em NestJS, TypeScript e arquitetura SaaS multi-tenant.

CONTEXTO:
Estamos iniciando o desenvolvimento do backend do Fidelizza — um CRM de reativação via WhatsApp para restaurantes delivery. Precisamos montar a fundação do projeto no Sprint 0.

DECISÕES JÁ TOMADAS (não questionar):
- Monólito modular NestJS (não microsserviços)
- PostgreSQL 16 com RLS multi-tenant (account_id em todas tabelas)
- Redis + BullMQ (noeviction obrigatório)
- Drizzle ORM (não Prisma/TypeORM)
- API e Workers como processos separados (main.ts e main.worker.ts)
- Erros RFC 7807 via AllExceptionsFilter
- Logs estruturados via nestjs-pino

TAREFA:
Gere os seguintes arquivos de fundação, prontos para produção, sem placeholders:
1. docker-compose.yml (postgres + redis com configurações corretas de produção)
2. src/config/env.schema.ts (validação Zod completa)
3. src/main.ts (bootstrap com helmet, CORS, ValidationPipe, shutdown hooks)
4. src/main.worker.ts (bootstrap standalone para workers)
5. src/common/filters/all-exceptions.filter.ts (RFC 7807)
6. src/common/errors/domain-error.ts com catálogo inicial de erros

Para cada arquivo, explique as decisões de implementação e sinalize os pontos críticos de segurança.
```

---

**🤖 PROMPT — Database Engineer (Sprint 0)**
```
Você é um Database Engineer especializado em PostgreSQL multi-tenant e SaaS de alto volume.

CONTEXTO:
Iniciando o projeto Fidelizza. Precisamos configurar a base de dados no Sprint 0.

HIERARQUIA DE TENANCY DECIDIDA:
- Account (direct | agency) → isolamento por RLS com account_id
- Restaurant → escopo operacional
- Toda query operacional DEVE passar por SET LOCAL app.account_id

TAREFA:
1. Gere o arquivo drizzle.config.ts
2. Gere a migration 0000_initial_setup.sql contendo:
   - Extensões necessárias (uuid-ossp ou pg_uuidv7, citext)
   - Configuração base do RLS
   - Tabela account com type direct/agency
   - Tabela subscription
   - Tabela app_user
   - Tabela restaurant
   - Tabela user_restaurant_access
   - Todas as policies RLS com FORCE ROW LEVEL SECURITY
3. Gere src/database/tenant-connection.ts com runInTenantContext usando set_config com parâmetro bindado ($1) — explique por que isso previne injeção
4. Gere src/database/schema/account.schema.ts e user.schema.ts no formato Drizzle ORM

Prioridade absoluta: isolamento entre tenants. Sinalize qualquer ponto onde um erro de implementação poderia vazar dados entre restaurantes.
```

---

### 🔐 SPRINT 1 — Auth + Tenant + Restaurant (Semana 2)

**Meta:** Login funcionando, contexto de tenant em toda request, CRUD de restaurante.

**Agentes ativos:** BE + SA + UX (início do design system)

**Tarefas técnicas:**
- [ ] Módulo `auth`: login, JWT access (15min) + refresh (7d), logout, `/auth/me`
- [ ] Módulo `tenant`: TenantContextService via AsyncLocalStorage
- [ ] TenantContextInterceptor em toda request autenticada
- [ ] RestaurantAccessGuard (valida user_restaurant_access)
- [ ] Módulo `restaurants`: CRUD + settings
- [ ] Tela de Login no Lovable (Prompt 1 da Fase 5)
- [ ] Setup do Design System no Lovable (Prompt 0 da Fase 5)

**Critério de aceite:**
- `POST /auth/login` retorna JWT válido
- Toda request sem JWT retorna 401
- Request com JWT de tenant A nunca retorna dados do tenant B (teste obrigatório)
- Seletor de restaurante aparece no frontend

---

**🤖 PROMPT — Backend Engineer (Sprint 1 — Auth)**
```
Você é um Backend Engineer Sênior especializado em NestJS, segurança e SaaS multi-tenant.

CONTEXTO DO PROJETO:
[Cole aqui o conteúdo do arquivo env.schema.ts, domain-error.ts e tenant-connection.ts gerados no Sprint 0]

TAREFA — Módulo Auth:
Implemente o módulo de autenticação completo do Fidelizza:

1. src/auth/auth.module.ts
2. src/auth/auth.controller.ts (POST /auth/login, POST /auth/refresh, POST /auth/logout, GET /auth/me)
3. src/auth/auth.service.ts
4. src/auth/strategies/jwt.strategy.ts
5. src/auth/dto/login.dto.ts e login-response.dto.ts
6. src/common/guards/jwt-auth.guard.ts
7. src/common/guards/restaurant-access.guard.ts

REGRAS CRÍTICAS:
- O JWT deve conter: sub (userId), accountId, role, allowedRestaurantIds[]
- allowedRestaurantIds é resolvido no login: para owner/admin = todos da account; para operator = apenas os de user_restaurant_access
- Refresh token deve ser revogável (armazenar hash no Redis com TTL)
- /auth/me retorna dados do usuário + restaurantes acessíveis (não o token completo)
- RestaurantAccessGuard valida se o restaurantId da rota está em allowedRestaurantIds do JWT

Mostre também como aplicar os guards nas rotas de forma global com override por rota.
```

---

**🤖 PROMPT — Backend Engineer (Sprint 1 — Tenant)**
```
Você é um Backend Engineer Sênior especializado em NestJS multi-tenant.

CONTEXTO:
[Cole auth.service.ts e jwt.strategy.ts implementados]

TAREFA — Módulo Tenant:
Implemente o isolamento de tenant em toda a stack:

1. src/tenant/tenant.module.ts
2. src/tenant/tenant-context.service.ts (usando AsyncLocalStorage — NÃO request-scoped providers)
3. src/tenant/tenant.types.ts (interface TenantContext)
4. src/common/interceptors/tenant-context.interceptor.ts
   - Lê accountId do JWT já validado
   - Chama tenantContext.run() com o contexto completo
   - Deve rodar APÓS o JwtAuthGuard
5. Atualize app.module.ts para aplicar o interceptor globalmente

PONTO CRÍTICO:
Explique por que AsyncLocalStorage é preferível a REQUEST_SCOPE providers para propagar o contexto de tenant para os workers BullMQ. Como os workers (que não têm request HTTP) devem setar o contexto?
```

---

**🤖 PROMPT — UX/Frontend Designer (Sprint 1)**
```
Você é um UX/Frontend Designer especializado em SaaS B2B, com expertise em Lovable, React e Tailwind.

CONTEXTO DO PRODUTO:
Fidelizza — CRM de reativação via WhatsApp para restaurantes delivery.
Princípios de design: densidade com respiro (estilo Linear/Pipedrive), ROI sempre visível, cor com propósito, ação primária única por tela.

Design tokens:
- Base: zinc-950 (texto) / zinc-50 (bg) / white (superfícies)
- Primária: indigo-600
- Sucesso/ROI: emerald-600
- Atenção: amber-500 | Perigo: rose-600
- Fonte: Inter, tabular-nums em métricas
- Bordas: rounded-lg

TAREFA:
Use os prompts abaixo (já validados pelo PO) para criar as primeiras telas no Lovable:

[Insira aqui o PROMPT 0 — Setup do Design System & Shell]
[Insira aqui o PROMPT 1 — Login]

Após gerar as telas, documente:
1. Quais componentes foram criados e onde reutilizá-los
2. Ajustes necessários para alinhar ao design system
3. Componentes que precisarão ser customizados no eject do Lovable
```

---

### 📥 SPRINT 2 — Integração + Clientes + Pedidos (Semanas 3-4)

**Meta:** Dados entrando no sistema. Primeiro elo do dinheiro funcionando.

**Agentes ativos:** BE + DE

**Tarefas técnicas:**
- [ ] Tabelas `integration`, `customer`, `order`, `order_item` com RLS
- [ ] Índices da Fase 4 (idx_customer_segment, idx_order_customer, etc.)
- [ ] Módulo `integrations`: CRUD + status
- [ ] IntegrationAdapter interface + AnotaAiAdapter (normalização E.164)
- [ ] POST `/webhooks/anota-ai` com HMAC time-safe + `@RawBody()`
- [ ] Tabela `webhook_event` + dedupe tripla
- [ ] Fila `integration.ingest` + IntegrationIngestProcessor
- [ ] Módulo `customers`: upsert por telefone E.164
- [ ] Módulo `orders`: insertIdempotent com `uq_order_external`
- [ ] CustomerAggregatesService (total_orders, total_spent, avg_ticket, last_order_at)
- [ ] Eventos `order.created` e `customer.updated` (EventEmitter2)

**Critério de aceite:**
- Webhook da Anota AI recebe, valida HMAC, persiste em webhook_event e responde 200 em < 50ms
- Processar o mesmo webhook 3x cria apenas 1 order (idempotência tripla comprovada)
- Customer.phone sempre armazenado em E.164
- Agregados do customer atualizados corretamente após cada pedido

---

**🤖 PROMPT — Database Engineer (Sprint 2)**
```
Você é um Database Engineer especializado em PostgreSQL multi-tenant de alto volume.

CONTEXTO:
[Cole migration 0000 já criada]

TAREFA — Migration de dados operacionais:
Gere migration 0001_operational_data.sql contendo:

1. Tabela integration (com CHECK em provider, credentials como JSONB para criptografia na app)
2. Tabela customer (phone E.164, agregados RFM, consent_whatsapp LGPD, UNIQUE por restaurant+phone)
3. Tabela orders PARTICIONADA POR RANGE MENSAL (ordered_at), incluindo:
   - PK composta (id, ordered_at)
   - UNIQUE uq_order_external (restaurant_id, integration_id, external_id, ordered_at)
   - Partições para os próximos 3 meses + partition DEFAULT
4. Tabela order_item com ordered_at denormalizado para join eficiente
5. Tabela webhook_event com UNIQUE uq_webhook_dedupe
6. Todos os índices da Fase 4 para estas tabelas
7. Policies RLS para TODAS as novas tabelas

PONTOS CRÍTICOS:
- Explique a decisão de particionar orders por mês com cálculo de linhas esperadas
- Por que uq_order_external inclui ordered_at? Como isso afeta queries de idempotência?
- Como criar partições futuras automaticamente? Mostre o job agendado.
```

---

**🤖 PROMPT — Backend Engineer (Sprint 2 — Webhooks)**
```
Você é um Backend Engineer Sênior especializado em sistemas de ingestão de dados resilientes.

CONTEXTO:
[Cole integration.module.ts, customer.service.ts e os schemas Drizzle gerados]

TAREFA — Sistema de Webhooks Anota AI (o elo 1 do dinheiro):

Implemente o sistema completo de ingestão seguindo o princípio "receber rápido, processar depois":

1. src/integrations/adapters/integration-adapter.interface.ts
   (interface NormalizedOrder + IntegrationAdapter)
2. src/integrations/adapters/anota-ai.adapter.ts
   - Normalização de telefone para E.164 (cobrir casos: DDDs, 9º dígito, +55 já presente)
   - Ignorar eventos != 'order.completed'
   - Retornar null se não houver telefone
3. src/integrations/webhooks.controller.ts
   - @SkipAuth(), @RawBody() para validação HMAC correta
   - Resposta em < 50ms obrigatório
4. src/integrations/anota-ai-webhook.service.ts
   - verifySignature com timingSafeEqual (explique por que não usar ===)
   - receiveAndEnqueue com ON CONFLICT DO NOTHING
   - jobId determinístico no BullMQ
5. src/integrations/processors/integration-ingest.processor.ts
   - runInTenantContext obrigatório
   - upsert customer por phone
   - insertIdempotent de order
   - Atualização de agregados
   - Emissão de order.created e customer.updated APÓS commit

Mostre também como configurar rawBody: true no bootstrap e como testar a idempotência tripla.
```

---

### 📊 SPRINT 3 — Segmentação RFM (Semana 5)

**Meta:** Motor de segmentação funcionando. Segundo elo do dinheiro.

**Agentes ativos:** BE + DE

**Tarefas técnicas:**
- [ ] Tabelas `segment` e `customer_segment` com RLS
- [ ] 4 segmentos fixos criados automaticamente para cada restaurante novo
- [ ] RfmEngineService (cálculo por percentis dentro de cada restaurante)
- [ ] SegmentationProcessor (fila `segmentation.recalculate`)
- [ ] CustomerUpdatedListener (dispara recálculo quando customer muda)
- [ ] Job agendado diário de recálculo global
- [ ] Endpoint GET `/restaurants/:rid/segments` com contagens
- [ ] POST `/restaurants/:rid/segments/recalculate` (força recálculo manual)

**Critério de aceite:**
- Restaurante com 10 clientes segmentados corretamente por percentil
- Recálculo em < 5s para até 10.000 clientes por restaurante
- Segmento do cliente atualizado em customer.current_segment_key
- Histórico de mudanças de segmento registrado em customer_segment

---

**🤖 PROMPT — Database Engineer (Sprint 3)**
```
Você é um Database Engineer especializado em analytics e modelagem de dados comportamentais.

CONTEXTO:
[Cole schemas de customer e orders já implementados]

TAREFA — Segmentação RFM:

1. Migration 0002_segmentation.sql:
   - Tabela segment (4 segmentos fixos por restaurante, UNIQUE key+restaurant)
   - Tabela customer_segment (snapshot histórico com is_current)
   - Índices para customer_segment

2. Queries SQL prontas para o motor RFM:
   a. Query de cálculo de percentis R, F, M por restaurante (usando PERCENT_RANK ou NTILE)
   b. Query de classificação nos 4 segmentos baseada nas regras:
      - Campeões: R>=4 AND F>=4 AND M>=4
      - Novos: F=1 AND R>=3
      - Em Risco: R<=2 AND F>=3
      - Inativos: R=1 AND F<=2
   c. Query de UPDATE em batch: customer + customer_segment em uma transação
   d. Query de contagem por segmento para o endpoint GET /segments

3. Por que calcular por percentis DENTRO de cada restaurante (não thresholds globais)?
   Mostre com exemplo numérico a diferença entre um restaurante de alto ticket vs marmitaria.
```

---

**🤖 PROMPT — Backend Engineer (Sprint 3)**
```
Você é um Backend Engineer Sênior especializado em processamento assíncrono com NestJS e BullMQ.

CONTEXTO:
[Cole as queries RFM geradas pelo DE + customer.service.ts]

TAREFA — Motor de Segmentação:

1. src/segments/rfm-engine.service.ts
   - calculateRfm(restaurantId): usa as queries SQL por percentil
   - Roda DENTRO de runInTenantContext
   - Atualiza customer.rfm_recency/frequency/monetary e current_segment_key
   - Grava snapshot em customer_segment (marca antigos como is_current=false)

2. src/segments/processors/segmentation.processor.ts
   - Fila: segmentation.recalculate
   - Concurrency: 5 (processar vários restaurantes em paralelo)
   - Idempotência: se o mesmo restaurantId já está na fila, não duplicar

3. src/segments/listeners/customer-updated.listener.ts
   - @OnEvent('customer.updated')
   - Enfileira recálculo APENAS para o restaurante afetado
   - Debounce: se o mesmo restaurante recebeu 50 pedidos simultâneos,
     enfileirar apenas 1 job (não 50)

4. src/segments/segments.controller.ts
   - GET /restaurants/:rid/segments (retorna 4 segmentos + contagens + % da base)
   - POST /restaurants/:rid/segments/recalculate (força recálculo, retorna jobId)

Mostre o esquema de debounce no BullMQ para evitar jobs duplicados.
```

---

### 📣 SPRINT 4 — Campanhas + Z-API (Semanas 6-7)

**⚠️ SPRINT MAIS ARRISCADO — Rate limiting anti-ban é obrigatório**

**Meta:** Disparo de campanhas funcionando com proteção anti-ban.

**Agentes ativos:** BE + SA

**Tarefas técnicas:**
- [ ] Tabelas `campaign`, `campaign_target`, `message_log` com RLS
- [ ] WhatsAppProvider interface + ZapiProvider (adapter isolado)
- [ ] RateLimiterService: token bucket por restaurant_id no Redis
- [ ] Warm-up de número configurável
- [ ] Módulo `campaigns`: criar, editar (só draft), preview, dispatch
- [ ] Dispatch com Idempotency-Key + INSERT...SELECT (snapshot em batch)
- [ ] Fila `campaign.dispatch` rate-limited com jitter
- [ ] POST `/webhooks/zapi/status` (status Z-API: delivered/read/failed)
- [ ] MessageStatusProcessor (fila `message.status`)
- [ ] Estimativa de duração comunicada ao usuário

**Critério de aceite:**
- Disparo de 100 mensagens obedece rate limit configurado
- Mesmo dispatch com a mesma Idempotency-Key não re-dispara
- Snapshot de targets criado via INSERT...SELECT (não loop na aplicação)
- Status de mensagem atualizado via webhook Z-API
- Troca de Z-API para outro provider afeta APENAS o módulo messaging

---

**🤖 PROMPT — Software Architect (Sprint 4 — Revisão de risco)**
```
Você é um Software Architect com foco em sistemas de mensageria e mitigação de risco.

CONTEXTO:
Estamos implementando o Sprint 4 do Fidelizza — o módulo de campanhas e integração com Z-API (WhatsApp não-oficial). O PO classificou o banimento do número como risco EXISTENCIAL.

TAREFA — Revisão e Especificação de Segurança Anti-ban:

1. Especifique os parâmetros do token bucket:
   - Rate limite recomendado por número (mensagens/minuto)
   - Jitter: variação aleatória para parecer tráfego humano
   - Warm-up: quantas mensagens nos primeiros 7 dias de um número novo
   - Como detectar que o número foi banido via Z-API

2. Valide a implementação do WhatsAppProvider interface:
   - Quais métodos a interface deve expor?
   - Como o ZapiProvider deve tratar erros HTTP 429 (rate limit) vs 403 (possível ban)?
   - Como comunicar saúde do número para o módulo de settings?

3. Especifique o fluxo de warm-up de novo número:
   - Como configurar por restaurante
   - Quando bloquear disparo de campanha grande em número novo
   - Alerta para o operador sobre o warm-up em andamento

4. Qual o contrato do módulo messaging com o resto do sistema?
   Liste o que o módulo EXPÕE e o que ele OCULTA (Z-API nunca deve vazar para outros módulos).
```

---

**🤖 PROMPT — Backend Engineer (Sprint 4 — Campanhas)**
```
Você é um Backend Engineer Sênior com experiência em sistemas de disparo de mensagens em escala.

CONTEXTO:
[Cole campaigns.service.ts parcial, whatsapp-provider.interface.ts, rate-limiter.service.ts]
[Referência obrigatória: ADR-005 (Z-API isolada), ADR-016 (Idempotency-Key), ADR-017 (rate limiting)]

TAREFA — Implementação completa do módulo de campanhas:

1. src/messaging/providers/whatsapp-provider.interface.ts
2. src/messaging/providers/zapi.provider.ts
   - sendMessage(phone, message): Promise<ZapiMessageResult>
   - getNumberHealth(restaurantId): Promise<NumberHealth>
   - Tratamento de erros: 429 → enfileira retry; 403 → alerta de possível ban
3. src/messaging/rate-limiter.service.ts
   - Token bucket no Redis por restaurant_id
   - Método acquire(): aguarda token disponível
   - Método estimateDuration(count): retorna segundos estimados
4. src/campaigns/campaigns.service.ts (método dispatch completo):
   - Validação: WhatsApp conectado? Segmento não-vazio?
   - Idempotência via Redis SETNX com TTL 24h
   - INSERT...SELECT para snapshot de targets (nunca loop)
   - Enfileiramento com delay escalonado + jitter
5. src/campaigns/processors/campaign-dispatch.processor.ts
   - Consume fila campaign.dispatch
   - Chama rate-limiter antes de cada envio
   - Cria message_log por envio
   - Atualiza campaign_target.status
6. src/messaging/webhooks.controller.ts (status Z-API)
7. src/messaging/processors/message-status.processor.ts

Inclua testes unitários para o rate limiter e para a idempotência do dispatch.
```

---

### 💰 SPRINT 5 — Dashboard de ROI (Semana 8)

**Meta:** A prova de ROI funcionando. Quarto elo do dinheiro.

**Agentes ativos:** BE + DE + UX

**Tarefas técnicas:**
- [ ] Tabela `conversion` com UNIQUE(order_id)
- [ ] ConversionAttributionService (janela configurável)
- [ ] Fila `conversion.attribution` + processor
- [ ] OrderCreatedListener (dispara atribuição)
- [ ] Módulo `analytics`: queries de dashboard + cache Redis
- [ ] Endpoints: `/analytics/dashboard`, `/analytics/rfm-distribution`
- [ ] Agregados materializados em `campaign` atualizados
- [ ] Todas as telas do frontend (Lovable — Prompts 2 a 8)
- [ ] Polling de status de campanha "sending" (a cada 5s)

**Critério de aceite:**
- 1 pedido jamais é atribuído a 2 campanhas (UNIQUE order_id testado)
- Dashboard carrega em < 500ms (cache Redis)
- Receita atribuída bate com soma manual das conversions (auditável)
- Telas de Dashboard, Clientes, Campanhas e Nova Campanha funcionando no Lovable

---

**🤖 PROMPT — Database Engineer (Sprint 5)**
```
Você é um Database Engineer especializado em analytics e queries de alta performance.

CONTEXTO:
[Cole schemas de campaign, campaign_target, message_log já implementados]

TAREFA — Atribuição de conversão e dashboard de ROI:

1. Migration 0003_conversion_analytics.sql:
   - Tabela conversion com UNIQUE(order_id) — explique por que isso garante ROI auditável
   - Índices para conversion

2. Query de atribuição de conversão (janela configurável):
   - Dado um order.created (customer_id, ordered_at, total_amount, restaurant_id)
   - Encontrar a campanha mais recente que atingiu este cliente nos últimos N dias
   - Inserir em conversion com ON CONFLICT DO NOTHING no order_id
   - Atualizar campaign.converted_count e campaign.revenue_attributed atomicamente

3. Queries do dashboard (otimizadas para cache):
   a. KPIs do período: receita_atribuída, taxa_conversão, clientes_reativados, campanhas_enviadas
   b. Série temporal: receita por dia no período (para o AreaChart)
   c. Distribuição RFM: contagem e % por segmento
   d. Funil da última campanha: targets → sent → delivered → read → converted → revenue
   e. Tabela "oportunidades": segmentos com clientes prontos para reativar

4. Estratégia de cache Redis:
   - Qual TTL para cada query?
   - Como invalidar o cache quando uma nova conversão é atribuída?
   - Chaves com namespace: dashboard:{account_id}:{restaurant_id}:roi:{period}
```

---

**🤖 PROMPT — Backend Engineer (Sprint 5 — Analytics)**
```
Você é um Backend Engineer Sênior especializado em módulos de analytics para SaaS.

CONTEXTO:
[Cole queries SQL de atribuição e dashboard geradas pelo DE]
[Cole analytics.service.ts parcial]

TAREFA — Módulo de Analytics e Atribuição:

1. src/analytics/conversion-attribution.service.ts
   - attributeConversion(event: OrderCreatedEvent): processa atribuição
   - Usa a query SQL com janela configurável
   - Atualiza agregados materializados da campaign atomicamente
   - Tudo dentro de runInTenantContext

2. src/analytics/processors/conversion-attribution.processor.ts
   - Fila: conversion.attribution
   - Idempotente: mesmo orderId processado 2x não duplica conversão
   - Concurrency: 10

3. src/analytics/listeners/order-created.listener.ts
   - @OnEvent('order.created')
   - Enfileira conversion.attribution com delay de 5s (esperar indexação)

4. src/analytics/analytics.service.ts
   - getDashboard(restaurantId, period): retorna todos os KPIs com cache Redis
   - getRfmDistribution(restaurantId): contagem por segmento
   - invalidateCache(restaurantId): chamado após nova conversão

5. src/analytics/analytics.controller.ts
   - GET /restaurants/:rid/analytics/dashboard?period=7d|30d|90d
   - GET /restaurants/:rid/analytics/rfm-distribution
   - GET /restaurants/:rid/whatsapp/status (para o alert global do frontend)

Inclua o mecanismo de cache Redis com namespace correto e invalidação.
```

---

**🤖 PROMPT — UX/Frontend Designer (Sprint 5)**
```
Você é um UX/Frontend Designer especializado em SaaS B2B com experiência em Lovable e React.

CONTEXTO:
[Cole os contratos de API do analytics.controller.ts]
API base: https://staging.fidelizza.com

TAREFA — Implementar as telas restantes no Lovable:

Use os prompts validados pelo PO (Fases 5) na seguinte ordem:
1. PROMPT 7 — Integrações (conectar fonte de dados)
2. PROMPT 3 — Clientes (lista com segmentos)
3. PROMPT 4 — Cliente (perfil + timeline)
4. PROMPT 6 — Nova Campanha (wizard 3 passos com preview WhatsApp)
5. PROMPT 6B — Campanha detalhe (funil de ROI ao vivo)
6. PROMPT 5 — Campanhas lista
7. PROMPT 2 — Dashboard (tela hero de ROI)
8. PROMPT 8 — Configurações

Após cada tela, documente:
- Endpoints consumidos (para alinhar com o Backend)
- Estados implementados (loading, empty, error, populated)
- Componentes reutilizados do design system

REGRAS INEGOCIÁVEIS:
- revenue_attributed vem pronto do backend — o frontend NUNCA calcula ROI
- Status "sending" usa polling a cada 5s (sem WebSocket)
- Idempotency-Key deve ser gerada no frontend (UUID v4) antes do dispatch
```

---

### 🔒 SPRINT 6 — Hardening + Go-live (Semana 9)

**Meta:** Sistema pronto para o primeiro restaurante piloto real.

**Agentes ativos:** SA + BE + PS

**Tarefas técnicas:**
- [ ] Testes de carga no disparo (simular 1000 mensagens com rate limit)
- [ ] Bull Board configurado e acessível (atrás de auth)
- [ ] Alertas: falha de integração, fila travada > 5min, número Z-API desconectado
- [ ] Backup automático PostgreSQL (via Railway/Render)
- [ ] Documentação de onboarding do primeiro restaurante
- [ ] Smoke tests end-to-end do fluxo completo:
  - Login → Conectar Anota AI → Ver clientes → Criar campanha → Disparar → Ver ROI
- [ ] Eject do Lovable (se necessário para customizações)
- [ ] Configuração de domínio + SSL + CORS de produção
- [ ] Revisão de segurança: RLS testado com 2 tenants distintos

**Critério de aceite:**
- Fluxo completo funciona com restaurante real de teste
- Nenhum dado vaza entre tenants (teste automatizado)
- Rate limit anti-ban comprovado em teste de carga
- Bull Board mostrando filas saudáveis
- Backup automático configurado e testado

---

**🤖 PROMPT — Product Strategist (Sprint 6 — Go-live)**
```
Você é um Product Strategist com foco em SaaS B2B e lançamento de MVPs.

CONTEXTO:
Estamos na semana 9 do desenvolvimento do Fidelizza — CRM de reativação via WhatsApp para restaurantes delivery. O MVP "Máquina de Reativação" está tecnicamente pronto.

TAREFA — Plano de Go-live para o primeiro restaurante piloto:

1. CRITÉRIOS DE SELEÇÃO DO PILOTO:
   - Perfil ideal do restaurante piloto (tamanho, integração, disponibilidade)
   - Quais métricas mínimas na base de clientes para o MVP fazer sentido?
   - Como garantir que o operador terá tempo para usar o produto?

2. CHECKLIST DE ONBOARDING (operacional, não técnico):
   - O que o restaurante precisa preparar antes de conectar?
   - Qual o script da primeira sessão de onboarding?
   - Como explicar o ROI de forma que o dono entenda sem ver um dashboard?

3. DEFINIÇÃO DE SUCESSO DO PILOTO (4 semanas):
   - KPIs de produto: quais métricas provam que o MVP funciona?
   - KPI de negócio: qual receita atribuída mínima para considerar sucesso?
   - Quando cancelar o piloto e pivotar?

4. RISCOS COMERCIAIS PRÉ-LANÇAMENTO:
   - O custo Z-API está embutido no preço? Qual o pricing recomendado?
   - Qual o SLA de suporte que conseguimos honrar com time pequeno?
   - Qual a mensagem de venda para o segundo restaurante depois do piloto?
```

---

**🤖 PROMPT — Software Architect (Sprint 6 — Revisão Final)**
```
Você é um Software Architect responsável pela revisão final antes do go-live.

CONTEXTO:
MVP Fidelizza pronto para o primeiro restaurante piloto. Faça a revisão final da arquitetura.

TAREFA — Checklist de go-live técnico:

1. SEGURANÇA (prioridade máxima):
   - Teste de isolamento RLS: com 2 tenants diferentes no banco, confirme que nenhuma query vaza dados
   - Verificar que o usuário de banco não tem BYPASSRLS
   - Confirmar que SET LOCAL está sendo usado (não SET global)
   - Validar que credenciais da Anota AI estão criptografadas no banco

2. RESILIÊNCIA:
   - O que acontece se o Redis cair durante um disparo de campanha?
   - O que acontece se a Anota AI parar de enviar webhooks por 1 hora?
   - O que acontece se o número Z-API for banido no meio de uma campanha?
   - Quais filas têm dead-letter queue configurada?

3. OBSERVABILIDADE:
   - Alertas críticos configurados? (número Z-API, fila parada, integração com erro)
   - Bull Board acessível com autenticação?
   - Logs estruturados com accountId e restaurantId em TODOS os logs?

4. PERFORMANCE:
   - Tempo de resposta do endpoint /dashboard com dados reais (não mocked)?
   - Tempo do snapshot de targets para um segmento com 5000 clientes?
   - Rate de ingestão sustentável no pico de almoço (20 pedidos/min)?

Gere um relatório de prontidão com status ✅/⚠️/❌ para cada item.
```

---

## 📊 TIMELINE CONSOLIDADA

```
Semana 1:  Sprint 0 — Fundação          [SA + BE + DE]
Semana 2:  Sprint 1 — Auth/Tenant/UX    [BE + SA + UX]
Semana 3:  Sprint 2 — Integração        [BE + DE]        ★ ELO 1
Semana 4:  Sprint 2 — Clientes/Pedidos  [BE + DE]        ★ ELO 1
Semana 5:  Sprint 3 — Segmentação RFM   [BE + DE]        ★ ELO 2
Semana 6:  Sprint 4 — Campanhas/Z-API   [BE + SA]        ★ ELO 3 ⚠️ RISCO
Semana 7:  Sprint 4 — Hardening Z-API   [BE + SA]        ★ ELO 3 ⚠️ RISCO
Semana 8:  Sprint 5 — Dashboard ROI     [BE + DE + UX]   ★ ELO 4
Semana 9:  Sprint 6 — Go-live           [SA + BE + PS]
```

---

## 🚨 PENDÊNCIAS CRÍTICAS (resolver antes de codar)

| # | Pendência | Urgência | Responsável |
|---|---|---|---|
| 1 | **Anota AI: webhook push ou polling?** | 🔴 Alta | BE + Anota AI |
| 2 | **Tenant no webhook: payload ou URL única?** | 🔴 Alta | BE + Anota AI |
| 3 | **Credenciais de dev Anota AI** (burocracia!) | 🔴 Alta | Murilo |
| 4 | **Conta Z-API criada** | 🔴 Alta | Murilo/Dev |
| 5 | **Pricing com Z-API embutido** | 🟠 Média | Murilo |
| 6 | **Nome definitivo do produto** | 🟡 Baixa | Sócios |

---

## 📐 REGRAS DE TRABALHO COM OS AGENTES

### Como usar os prompts
1. **Sempre forneça contexto** — cole o código já gerado nas seções marcadas com `[Cole aqui...]`
2. **Um agente por vez** — não misture tarefas de BE e DE no mesmo prompt
3. **Valide antes de continuar** — cada Sprint tem critérios de aceite; confirme antes de avançar
4. **Itere no mesmo agente** — se a resposta não estiver certa, continue a conversa no mesmo chat

### Ordem de consulta dos agentes por tipo de dúvida
| Tipo de dúvida | Agente |
|---|---|
| "Vale a pena construir essa feature?" | PS (Product Strategist) |
| "Como essa decisão afeta a arquitetura?" | SA (Software Architect) |
| "Como implementar esse módulo NestJS?" | BE (Backend Engineer) |
| "Como modelar essa query/tabela?" | DE (Database Engineer) |
| "Como essa tela deve funcionar?" | UX (Frontend Designer) |

### Sinais de alerta — chame o SA antes de continuar
- Você está prestes a criar um novo módulo não previsto
- Uma implementação parece exigir múltiplas tabelas novas
- O rate limit anti-ban está sendo alterado
- Uma query não usa account_id ou restaurant_id no WHERE

---

## 🎯 DEFINIÇÃO DE MVP PRONTO

O MVP está pronto para go-live quando:

- [ ] Integração com Anota AI ou Cardápio Web recebe pedidos reais
- [ ] Base de clientes segmentada em 4 grupos (RFM por percentil)
- [ ] Campanha pode ser criada e disparada para um segmento
- [ ] Dashboard mostra receita atribuída real (não mocked)
- [ ] Fluxo completo testado com restaurante piloto real
- [ ] Nenhum dado vaza entre tenants (teste automatizado)
- [ ] Rate limit anti-ban comprovado
- [ ] Backup automático do banco configurado

---

*Cronograma gerado pelo PMO/PO do Fidelizza — v1.0*
*Baseado no planejamento consolidado Fases 1-7*
