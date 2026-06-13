# Informações relevantes
## Estrutura sistêmica

**Frontend:**
- React.js
- Lovable (MVP)
**Backend:**
- NestJS
- TypeScript
- Node.js
**Banco:**
- PostgreSQL
**Cache:**
- Redis
**Filas:**
- BullMQ
**Integrações:**
- Anota.AI
- Cardápio Web (futuro)
- Z-API (WhatsApp)
**Infra:**
- Docker
- Railway/Render (MVP)
**Observabilidade:**
- Pino
- Sentry

# FASE 1 — DESCOBRIR O PRODUTO 
## Resposta do Product Owner 
---
## RESUMO EXECUTIVO
O produto só gera dinheiro quando converte **dado em pedido**. Tudo que não contribui diretamente para esse ciclo é acessório no MVP. 
A Repediu vende basicamente uma coisa: **transformar a base de clientes do restaurante em faturamento recorrente via WhatsApp**.
É isso que precisamos replicar primeiro (*rápido, barato e com ROI visível*)

--- 
## Fluxo principal de valor
### O que gera dinheiro?
O envio de **campanhas segmentadas via WhatsApp** que trazem o cliente para pedir novamente. O dinheiro nasce na **conversão da campanha**, não no software em si. 
### O que o cliente compra? 
O restaurante NÃO compra "um CRM". Ele compra: 

> **"Faturamento adicional que eu não teria sem isso."**
 
 Ele compra a promessa de **recuperar clientes inativos** e **aumentar a frequência de pedidos** sem depender do iFood.
### O que não pode faltar? 
O fluxo mínimo irredutível de valor: 
```
INTEGRAÇÃO (capturar pedidos/clientes reais)  //Dados de comportamento/recorrência
↓
BASE DE CLIENTES (telefone + histórico)       //Comportamento + Base de uso
↓ 
SEGMENTAÇÃO (quem está inativo / em risco)    //Algoritmo Simples
↓
CAMPANHA WHATSAPP (mensagem + oferta)         //Algoritmo Inteligente
↓
ROI (provar que voltou dinheiro)              //Exibição de resultado
```
  
  **Insight crítico:** Se qualquer elo dessa corrente quebrar, o produto não vende. O elo mais frágil e mais importante é o *WhatsApp + ROI*. 
  Se o Whatsapp *falhar*, ou causar *banimento* do número do restaurante, perdemos o cliente.
  Sem ROI *visível* e *claro*, o restaurante cancela no segundo mês. 
  
  --- 
## Funcionalidades da Repediu: o que gera valor x complementar 
| Funcionalidade                                    | Classificação   | Por quê                                                        |
| ------------------------------------------------- | --------------- | -------------------------------------------------------------- |
| Integração com PDV/cardápio                       | **OBRIGATÓRIO** | Sem dado não há CRM                                            |
| Base unificada de clientes                        | **OBRIGATÓRIO** | É o ativo que o restaurante "aluga" de nós                     |
| Segmentação RFM (inativos, em risco, campeões)    | **OBRIGATÓRIO** | É o que torna a campanha eficaz                                |
| Disparo de campanha via WhatsApp                  | **OBRIGATÓRIO** | É o canal que gera receita                                     |
| Dashboard de ROI/conversão                        | **OBRIGATÓRIO** | É o que justifica a mensalidade                                |
| Automações (reativação, aniversário, boas-vindas) | IMPORTANTE      | Reduz esforço e aumenta retenção, mas pode vir logo após o MVP |
| Cupons/ofertas dentro da campanha                 | IMPORTANTE      | Aumenta conversão, mas pode ser texto manual no início         |
| Programa de fidelidade / clube VIP / pontos       | FUTURO**        | Alto esforço, baixa urgência de venda                          |
| Multicanal (SMS, e-mail, push, RCS)               | FUTURO**        | WhatsApp resolve 90% do valor                                  |
| IA preditiva (churn, recompra, recomendação)      | FUTURO**        | Diferencial, não entrada                                       |

 **Regra de ouro:** 
 - Obrigatório = Está no caminho do dinheiro. 
 - Importante = Melhora o caminho. 
 - Futuro = Cria novo caminho. 
 
---
## MVP mais enxuto capaz de gerar receita
### MVP RECOMENDADO ("Máquina de Reativação") 
```
1 INTEGRAÇÃO (A mais fácil/Comum no ICP)         // Consultar França
↓
CLIENTES (importação automática + perfil básico) // 
↓
SEGMENTAÇÃO RFM SIMPLES (4 segmentos fixos) 
↓
CAMPANHA MANUAL VIA WHATSAPP (template + variáveis)
↓
DASHBOARD DE ROI (1 tela: enviados → pedidos → R$) 
``` 

### Decisões de escopo do MVP
- **Escolher UMA integração inicial**, não três. Sugestão: priorizar a de maior penetração no ICP do Murilo (validar entre Anota AI / Cardápio Web / Saipos qual tem mais base acessível). #frança
- **Segmentação fixa**, sem construtor de filtros. Só os 4 segmentos RFM. 
- **Campanha manual**, não automação. O operador escolhe segmento → escreve mensagem → dispara.
- **ROI por atribuição simples**: cliente recebeu campanha + fez pedido em até X dias = conversão atribuída. 
### Por que esse corte?
- Entrega o ciclo completo de valor (dado → dinheiro → prova).
- É vendável e cobrável no **dia 1**.
- Evita overengineering (sem multicanal, sem IA, sem fidelidade).
- Gera os dados necessários para construir a IA depois.

---
## Priorização MoSCoW 
### **ESSENCIAL** (sem isso não há produto vendável)
- Integração inicial (1 fonte de dados)
- Módulo de Clientes (importação + perfil + unificação básica por telefone)
- Segmentação RFM (Campeões, Novos, Em Risco, Inativos)
- Campanhas manuais via WhatsApp - Dashboard de ROI/Conversão
### **DESEJÁVEL** (logo após o MVP, aumenta retenção e ticket)
- Automações (Reativação, Aniversário, Boas-vindas)
- Cupons/ofertas dentro da campanha
- Métricas adicionais (ticket médio, frequência, retenção)
### **SE POSSÍVEL** (quando houver tração e base instalada) 
- Fidelização (cupons recorrentes, clube VIP, pontos)
- Segmentação avançada (horário, produto, frequência)
- Integrações adicionais (demais PDVs/ERPs) 
### **NÃO AGORA** (Futuro — Fase posterior do roadmap) 
- IA preditiva (churn, recompra, recomendação)
- Food Analytics avançado
- Multicanal (SMS, e-mail, push, RCS)
- Integração iFood (dependência regulatória/técnica alta) 
--- 
## BENEFÍCIOS
- **Time-to-revenue curto:** produto cobrável já no MVP.
- **Foco no ROI:** argumento de venda e antídoto contra churn.
- **Arquitetura preservada:** multi-tenant e PostgreSQL desde o início, sem overengineering de features.
- **Base de dados para IA futura:** cada campanha gera o dataset do diferencial competitivo. 
## RISCOS
- **WhatsApp como dependência crítica:** banimento/limite de envio é risco existencial. Definir desde já estratégia (API oficial vs. não-oficial) — isso impacta custo, escala e risco jurídico. **É a decisão técnica mais urgente.** #linares #moura 
- **Integração inicial mal escolhida:** se a primeira fonte de dados tiver baixa penetração no ICP, o funil de vendas trava. #frança 
- **Atribuição de ROI frágil:** se o restaurante não "acreditar" no número, cancela. Precisa ser simples e transparente. #linares #moura 
- **Paridade vira armadilha:** copiar tudo da Repediu sem cortar atrasa o lançamento. Manter disciplina no MVP.
- **Burocracia com Integração:** Apesar da API dos sistemas serem abertas, as credenciais de desenvolvedor geralmente possui certa burocracia para liberação.
## MVP RECOMENDADO (consolidado)
**"Máquina de Reativação via WhatsApp com ROI provado"** — 1 integração + clientes + RFM + campanha manual + dashboard de ROI. 

## EVOLUÇÕES FUTURAS
1. Automações (reativação/aniversário) → reduz esforço operacional. 
2. Mais integrações → amplia mercado endereçável.
3. Fidelização → aumenta LTV.
4. IA preditiva + Food Analytics → diferencial competitivo real vs. Repediu. 
---
**Pergunta de fundador que precisa ser respondida antes de codar:** 
>Qual será a estratégia de WhatsApp (API oficial Meta vs. não-oficial) e 

R: API não-oficial (Z-API) - Utilizar método de envio por número próprio, com resposta linkada ao número do cliente. Mitiga chance de banimento do número do restaurante. #linares #moura 

> Qual a integração de entrada.

R: Anota.AI ou Cardapio Web #frança 

# FASE 2 — MODELAGEM DE DOMÍNIO

> Documento de referência. Será usado por meses. Escrito para durar, mas sem overengineering — fiel ao MVP "Máquina de Reativação via WhatsApp com ROI provado".

---

## Entidades principais do domínio
Validei a lista sugerida e fiz ajustes de arquiteto. Algumas entidades são **núcleo do MVP**, outras são **suporte obrigatório** (multi-tenant, integração Z-API).

### Entidades núcleo (MVP)

```txt
Tenant            → o restaurante como unidade de cobrança/isolamento
Restaurant        → a operação (pode haver multi-loja no futuro)
User              → operadores que acessam o painel
Integration       → conexão com Anota AI / Cardápio Web
Customer          → o ativo central (telefone + histórico)
Order             → pedido importado da integração
OrderItem         → itens do pedido (base para analytics futuro)
Segment           → definição de segmento RFM
CustomerSegment   → relação cliente↔segmento (snapshot calculado)
Campaign          → campanha criada pelo operador
CampaignTarget    → cada cliente-alvo de uma campanha
MessageLog        → cada mensagem enviada via Z-API (rastreio/status)
Conversion        → atribuição: pedido gerado após campanha
```

### Por que separei Tenant de Restaurant?

No MVP, **1 Tenant = 1 Restaurant** na prática. Mas separar agora custa quase zero e evita refactor doloroso quando vier rede/franquia (vários restaurantes sob um contrato). É a única "antecipação arquitetural" que recomendo — todo o resto segue o MVP enxuto.

### Por que adicionei CampaignTarget, MessageLog e Conversion?
São **o coração do ROI**, que o PO classificou como elo existencial. Sem rastrear:
- Quem foi alvo (`CampaignTarget`)
- O que foi enviado e qual status (`MessageLog`)
- Quem comprou depois (`Conversion`)

...não há prova de ROI. E sem ROI, churn no segundo mês.

---

## Domain Model completo

### Diagrama de relacionamentos

```
┌─────────────┐
│   Tenant    │ 1
└──────┬──────┘
       │ 1..N
       ├──────────────► User
       │
       │ 1..N
       ▼
┌─────────────┐
│ Restaurant  │ 1
└──────┬──────┘
       │
       │ 1..N
       ├──────────────► Integration
       │
       │ 1..N
       ├──────────────► Customer ◄────────┐
       │                   │ 1            │
       │                   │ 1..N         │
       │                   ▼              │
       │              ┌─────────┐         │
       │              │  Order  │ 1       │
       │              └────┬────┘         │
       │                   │ 1..N         │
       │                   ▼              │
       │              ┌──────────┐        │
       │              │OrderItem │        │
       │              └──────────┘        │
       │                                  │
       │ 1..N                             │
       ├──────────────► Segment           │
       │                   │ 1            │
       │                   │ N..N         │
       │                   ▼              │
       │           ┌───────────────┐      │
       │           │CustomerSegment├──────┘
       │           └───────────────┘
       │
       │ 1..N
       ▼
┌─────────────┐
│  Campaign   │ 1
└──────┬──────┘
       │ 1..N
       ▼
┌────────────────┐ N ──────► Customer
│ CampaignTarget │ 1
└───────┬────────┘
        │ 1..1
        ▼
┌────────────────┐
│   MessageLog   │  (status Z-API)
└────────────────┘

┌────────────────┐
│   Conversion   │ ──► liga Campaign + Customer + Order
└────────────────┘
```

### Explicação dos relacionamentos

| Relação                              | Cardinalidade           | Regra de negócio                                                   |
| ------------------------------------ | ----------------------- | ------------------------------------------------------------------ |
| Tenant → Restaurant                  | 1:N                     | Isolamento multi-tenant. No MVP, 1:1 na prática.                   |
| Tenant → User                        | 1:N                     | Operadores do painel.                                              |
| Restaurant → Integration             | 1:N                     | Hoje 1 ativa (Anota/Cardápio), mas modelado para N.                |
| Restaurant → Customer                | 1:N                     | Cliente pertence ao restaurante (não compartilhado entre tenants). |
| Customer → Order                     | 1:N                     | Histórico de pedidos. Base do RFM.                                 |
| Order → OrderItem                    | 1:N                     | Itens. No MVP só armazenamos; analytics vem na Fase 4.             |
| Segment ↔ Customer                   | N:N via CustomerSegment | Um cliente pode estar em vários segmentos calculados.              |
| Restaurant → Campaign                | 1:N                     | Campanhas criadas pelo operador.                                   |
| Campaign → CampaignTarget            | 1:N                     | "Fotografia" dos clientes-alvo no momento do disparo.              |
| CampaignTarget → MessageLog          | 1:1                     | Status de envio Z-API (enviado/entregue/lido/falha).               |
| Conversion → Campaign+Customer+Order | N:1 cada                | Atribuição: pedido em até X dias após mensagem.                    |
#linares #moura *No futuro podemos gerar uma base de clientes para uso "entre tenants"*

### Detalhe crítico: por que CampaignTarget congela o cliente?

Quando o operador dispara, gravamos o snapshot do alvo (telefone, segmento na hora, nome). Isso garante que o **ROI seja auditável** mesmo que o cliente mude de segmento depois. Número de ROI precisa ser imutável e defensável diante do dono do restaurante.

### Atributos essenciais por entidade (resumo)

```txt
Customer
  id, tenant_id, restaurant_id,
  phone (E.164, chave de unificação),
  name, first_order_at, last_order_at,
  total_orders, total_spent, avg_ticket,
  rfm_recency, rfm_frequency, rfm_monetary,
  current_segment_id

Order
  id, tenant_id, restaurant_id, customer_id,
  external_id (id na integração — idempotência),
  total_amount, ordered_at, channel, source_integration_id

Campaign
  id, tenant_id, restaurant_id,
  name, segment_id, message_template,
  status (draft|scheduled|sending|sent|failed),
  scheduled_at, sent_at, attribution_window_days

CampaignTarget
  id, campaign_id, customer_id,
  phone_snapshot, segment_snapshot,
  status (pending|sent|delivered|read|failed|converted)

MessageLog
  id, campaign_target_id,
  zapi_message_id, status, error_reason,
  sent_at, delivered_at, read_at

Conversion
  id, campaign_id, customer_id, order_id,
  attributed_amount, attributed_at
```

---

## Fluxos de negócio (diagramas textuais)

### Fluxo 1 — Ingestão de pedido (Integração → Base)

```txt
Webhook/Polling da Integração (Anota AI / Cardápio Web)
↓
[Fila: integration.ingest]
↓
Normalizar payload (adapter por integração)
↓
Idempotência? (external_id já existe?) ──sim──► descarta
↓ não
Upsert Customer (chave: phone E.164)
↓
Criar Order + OrderItems
↓
Atualizar agregados do Customer
  (total_orders, total_spent, last_order_at, avg_ticket)
↓
[Evento: customer.updated] → dispara recálculo RFM
```

### Fluxo 2 — Cálculo de segmentação RFM

```txt
[Evento: customer.updated]  OU  [Job agendado diário]
↓
[Fila: segmentation.recalculate]
↓
Calcular R, F, M do cliente (percentis dentro do restaurante)
↓
Classificar em segmento fixo:
  Campeões | Novos | Em Risco | Inativos
↓
Atualizar CustomerSegment + current_segment_id
↓
[Evento: customer.segmented]
```

> **Decisão de arquiteto:** RFM calculado por **percentis dentro de cada restaurante**, não thresholds globais. Um restaurante de alto ticket tem realidade diferente de uma marmitaria.

### Fluxo 3 — Criação e disparo de campanha

```txt
Operador seleciona Segmento (ex.: Inativos)
↓
Escreve mensagem (template + variáveis: {nome})
↓
Define janela de atribuição (default: 7 dias)
↓
Cria Campaign (status=draft)
↓
[Ação: Disparar]
↓
Snapshot dos clientes do segmento → CampaignTarget[]
↓
Campaign.status = sending
↓
[Fila: campaign.dispatch] (rate-limited!)
↓
Para cada target:
  → Render template com variáveis
  → Enviar via Z-API
  → Criar MessageLog
  → Respeitar rate limit (anti-ban)
↓
Campaign.status = sent
```

> **Ponto crítico de risco (PO destacou):** Z-API não-oficial. O `campaign.dispatch` **obrigatoriamente** roda com rate limiting + jitter + warm-up de número. Disparo em massa = banimento = produto morto.

### Fluxo 4 — Atualização de status de mensagem

```txt
Z-API Webhook (status: delivered/read/failed)
↓
[Fila: message.status]
↓
Localizar MessageLog por zapi_message_id
↓
Atualizar status + timestamps
↓
Atualizar CampaignTarget.status
```

### Fluxo 5 — Atribuição de conversão (o ROI)

```txt
[Evento: order.created] (vindo do Fluxo 1)
↓
[Fila: conversion.attribution]
↓
Esse customer foi target de campanha
  nos últimos N dias (attribution_window)?
↓ sim
Criar Conversion (campaign + customer + order + valor)
↓
CampaignTarget.status = converted
↓
Atualizar métricas agregadas da Campaign
↓
Dashboard reflete: enviados → entregues → pedidos → R$
```

### Fluxo macro consolidado (visão CEO)

```txt
INTEGRAÇÃO → CLIENTE → SEGMENTAÇÃO → CAMPANHA → MENSAGEM → PEDIDO → ROI
   (dado)    (ativo)  (inteligência)  (ação)     (canal) (receita) (prova)
```

---

# FASE 3 — ARQUITETURA

## PERGUNTA 8 — Arquitetura completa do sistema

### Arquitetura proposta

Recomendo **monólito modular** (modular monolith) em NestJS, **não microsserviços**. Justificativa de CTO: no MVP, microsserviços seriam overengineering puro — aumentam custo operacional, complexidade de deploy e tempo de validação. O NestJS com módulos bem isolados nos dá fronteiras claras para extrair serviços **só quando a escala exigir**.

```txt
┌───────────────────────────────────────────────────────────┐
│                        USUÁRIO                            │
│              (Operador do Restaurante)                    │
└────────────────────────────┬──────────────────────────────┘
                            │ HTTPS
                            ▼
┌───────────────────────────────────────────────────────────┐
│  FRONTEND — React + Vite + Tailwind + Shadcn + Recharts   │
│  (Hospedado em Vercel / Cloudflare Pages)                 │
└────────────────────────────┬──────────────────────────────┘
                            │ REST / JSON (JWT)
                            ▼
┌───────────────────────────────────────────────────────────┐
│  API GATEWAY / BFF — NestJS (modular monolith)            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Auth │ Restaurant │ Customer │ Orders │ Campaigns  │  │
│  │  Segments │ Integrations │ Analytics │ Webhooks     │  │
│  └─────────────────────────────────────────────────────┘  │
│  Middleware: TenantContext + RateLimit + Validation       │
└──────┬───────────────────────┬─────────────────┬──────────┘
       │                       │                 │
       ▼                       ▼                 ▼
┌─────────────┐      ┌──────────────────┐  ┌──────────────┐
│ PostgreSQL  │      │  Redis + BullMQ  │  │  Z-API       │
│ (multi-     │      │  (filas/cache)   │  │ (WhatsApp)   │
│  tenant RLS)│      └────────┬─────────┘  └──────────────┘
└─────────────┘               │
                              ▼
              ┌────────────────────────────────┐
              │   WORKERS (NestJS standalone)  │
              │  integration.ingest            │
              │  segmentation.recalculate      │
              │  campaign.dispatch (rate-lim)  │
              │  conversion.attribution        │
              │  message.status                │
              └────────────────────────────────┘
                              ▲
                              │ Webhooks
              ┌───────────────┴────────────────┐
              │  Anota AI / Cardápio Web       │
              └────────────────────────────────┘
```

### Componentes detalhados

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| **Frontend** | React + Vite, Tailwind, Shadcn, Recharts | Painel, campanhas, dashboard ROI. Eject do Lovable assim que estabilizar. |
| **API** | NestJS + TypeScript | REST, autenticação, regras de negócio, validação. |
| **Workers** | NestJS standalone + BullMQ | Processamento assíncrono (ingestão, segmentação, disparo, atribuição). |
| **Banco** | PostgreSQL 15+ | Dados transacionais, multi-tenant via RLS + tenant_id. |
| **Cache/Filas** | Redis + BullMQ | Filas, rate limiting de WhatsApp, cache de dashboard. |
| **WhatsApp** | Z-API (não-oficial) | Canal de envio. Isolado atrás de um adapter. |
| **Hospedagem** | Railway/Render (início) → AWS (escala) | Containers Docker. |
| **Observabilidade** | Pino + Grafana/Loki + Sentry | Logs estruturados, erros, métricas de fila. |

### Decisão-chave: separar API de Workers

A API responde rápido ao usuário. Os Workers fazem o trabalho pesado e arriscado (disparo Z-API com rate limit). Separá-los desde já permite:
- Escalar workers independentemente da API.
- Falha de disparo não derruba o painel.
- Rate limiting de WhatsApp centralizado e seguro.

### Custos estimados (MVP, mensal)

```txt
Hospedagem (Railway/Render):  US$ 20–50
PostgreSQL gerenciado:        US$ 15–30
Redis gerenciado:             US$ 10–20
Z-API (por instância/número): R$ 100–200 por número
Vercel (frontend):            US$ 0–20
Sentry (free tier):           US$ 0
─────────────────────────────────────────
TOTAL inicial: ~US$ 70–120 + Z-API por restaurante
```

> **Insight de CTO sobre custo:** o custo de Z-API escala por número de WhatsApp. Isso impacta diretamente o modelo de precificação — precisa estar embutido na mensalidade do restaurante. Conversar com o sócio comercial (Murilo) sobre isso antes de definir preço.

---

## PERGUNTA 9 — Módulos do backend

```txt
src/
├── common/            → guards, interceptors, tenant-context, filters
├── auth/              → JWT, login, refresh, RBAC básico
├── tenant/            → isolamento multi-tenant, contexto de request
├── restaurant/        → CRUD restaurante, configurações
├── integrations/      → adapters (Anota AI, Cardápio Web), webhooks de entrada
├── customers/         → base de clientes, unificação por telefone, perfil
├── orders/            → ingestão de pedidos, itens, idempotência
├── segments/          → motor RFM, classificação, recálculo
├── campaigns/         → criação, disparo, targets, templates
├── messaging/         → adapter Z-API, message log, status webhooks
├── analytics/         → dashboard, ROI, agregações, conversões
└── queues/            → definição BullMQ, processors compartilhados
```

### Responsabilidade de cada módulo

| Módulo           | Responsabilidade central                                | Prioridade MVP |
| ---------------- | ------------------------------------------------------- | -------------- |
| **auth**         | Login, JWT, controle de acesso                          | MUST           |
| **tenant**       | Garantir isolamento de dados por restaurante            | MUST           |
| **integrations** | Receber dados (webhook/polling), normalizar via adapter | MUST           |
| **customers**    | Centralizar e unificar clientes por telefone            | MUST           |
| **orders**       | Persistir pedidos com idempotência                      | MUST           |
| **segments**     | Calcular RFM e classificar nos 4 segmentos              | MUST           |
| **campaigns**    | Criar e disparar campanhas, gerar targets               | MUST           |
| **messaging**    | Isolar Z-API, rate limit, rastrear status               | MUST           |
| **analytics**    | Provar ROI (enviados→pedidos→R$)                        | MUST           |

> **Princípio de design:** o módulo `messaging` **encapsula totalmente** a Z-API. Se amanhã trocarmos para API oficial Meta (mitigação do risco existencial de banimento), só esse módulo muda. O resto do sistema não sabe que Z-API existe. Isso é o seguro de vida da arquitetura.

### Padrão de comunicação interna

```txt
Módulos NÃO se chamam diretamente para fluxos assíncronos.
Comunicam via EVENTOS (EventEmitter2) → enfileiram em BullMQ.

Exemplo:
orders.service → emite "order.created"
       ↓
segments.listener  → enfileira recálculo RFM
analytics.listener → enfileira atribuição de conversão
```

Isso mantém os módulos desacoplados e prepara o terreno para extração de microsserviços no futuro, sem comprometer a velocidade agora.

---

## PERGUNTA 10 — Roadmap técnico de implementação

Ordenado por **dependência técnica** e **caminho do dinheiro** (alinhado ao PO).

### Sprint 0 — Fundação (1 semana)
```txt
□ Setup NestJS modular monolith + TypeScript
□ Docker Compose: Postgres + Redis local
□ Configuração BullMQ
□ Estrutura multi-tenant (tenant_id + RLS no Postgres)
□ CI/CD básico + ambiente de staging
□ Observabilidade base (Pino logs + Sentry)
```

### Sprint 1 — Auth + Tenant + Restaurant (1 semana)
```txt
□ Módulo auth (JWT, login, refresh)
□ Módulo tenant (contexto de request, isolamento)
□ Módulo restaurant (CRUD, settings)
□ Guards de tenant em todas as rotas
```

### Sprint 2 — Integração + Clientes + Pedidos (2 semanas) ★ ELO 1 DO DINHEIRO
```txt
□ Módulo integrations: adapter Anota AI / Cardápio Web
□ Webhook/polling de ingestão
□ Fila integration.ingest com idempotência (external_id)
□ Módulo customers: upsert por telefone E.164
□ Módulo orders: persistência + agregados
□ Evento customer.updated
```

### Sprint 3 — Segmentação RFM (1 semana) ★ ELO 2
```txt
□ Módulo segments: motor RFM por percentis
□ Fila segmentation.recalculate
□ 4 segmentos fixos (Campeões, Novos, Em Risco, Inativos)
□ CustomerSegment + current_segment_id
□ Listener de customer.updated
```

### Sprint 4 — Campanhas + Z-API (2 semanas) ★ ELO 3 — O MAIS ARRISCADO
```txt
□ Módulo messaging: adapter Z-API isolado
□ Rate limiting + jitter + warm-up (ANTI-BAN)
□ Módulo campaigns: criar, snapshot de targets
□ Fila campaign.dispatch (rate-limited)
□ MessageLog + webhook de status Z-API
□ Templates com variáveis ({nome})
```

### Sprint 5 — Dashboard de ROI (1 semana) ★ ELO 4 — A PROVA
```txt
□ Fila conversion.attribution (janela configurável)
□ Entidade Conversion + atribuição
□ Módulo analytics: enviados → entregues → pedidos → R$
□ Endpoints de dashboard + cache Redis
□ Frontend: tela única de ROI com Recharts
```

### Sprint 6 — Hardening + Go-live (1 semana)
```txt
□ Testes de carga no disparo (validar anti-ban)
□ Monitoramento de filas (Bull Board)
□ Alertas (falha de integração, fila travada, ban Z-API)
□ Backup automático Postgres
□ Onboarding do primeiro restaurante piloto
```

### Linha do tempo consolidada

```txt
Sprint 0  ──► Fundação              [Semana 1]
Sprint 1  ──► Auth/Tenant           [Semana 2]
Sprint 2  ──► Integração/Clientes   [Semanas 3-4]  ★
Sprint 3  ──► Segmentação RFM       [Semana 5]     ★
Sprint 4  ──► Campanhas/Z-API       [Semanas 6-7]  ★ risco
Sprint 5  ──► Dashboard ROI         [Semana 8]     ★
Sprint 6  ──► Hardening/Go-live     [Semana 9]
─────────────────────────────────────────────────
MVP vendável: ~9 semanas
```

---

## ESCALABILIDADE

| Dimensão         | Estratégia MVP           | Estratégia de escala (milhares de restaurantes)     |
| ---------------- | ------------------------ | --------------------------------------------------- |
| **API**          | 1 instância              | Horizontal scaling stateless atrás de load balancer |
| **Workers**      | 1 worker                 | Escalar por fila; disparo separado da ingestão      |
| **Postgres**     | Instância única          | Read replicas + particionamento por tenant_id       |
| **Redis**        | Instância única          | Redis Cluster                                       |
| **Multi-tenant** | RLS + tenant_id          | Pool de conexões por tenant; eventual sharding      |
| **Z-API**        | 1 número por restaurante | Pool de números + rotação + warm-up automatizado    |

---

## RISCOS E MITIGAÇÕES

| Risco                        | Severidade     | Mitigação                                                                                                      |
| ---------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| **Banimento Z-API**          | 🔴 Existencial | Adapter isolado (troca fácil p/ Meta oficial), rate limit agressivo, warm-up, monitoramento de saúde do número |
| **Integração mal escolhida** | 🟠 Alto        | Adapter pattern permite trocar/somar fontes sem refactor; validar penetração no ICP com Murilo                 |
| **ROI não convincente**      | 🟠 Alto        | Atribuição simples e transparente; snapshot imutável; dashboard auditável                                      |
| **Acoplamento Lovable**      | 🟡 Médio       | Frontend desacoplado da API por contrato REST; eject planejado                                                 |
| **Overengineering**          | 🟡 Médio       | Monólito modular, não microsserviços; só Tenant antecipado                                                     |

---

## RECOMENDAÇÕES FINAIS (visão CTO)

1. **A decisão mais urgente já foi tomada** (Z-API + Anota/Cardápio). Bom. Mas **blinde o módulo messaging** desde a primeira linha — é seu seguro contra o risco existencial.

2. **Não construa construtor de filtros, multicanal nem IA agora.** O roadmap acima entrega receita em ~9 semanas. Disciplina de escopo é vantagem competitiva.

3. **Cada campanha gera o dataset da IA futura.** Modele `Conversion` e `MessageLog` com capricho — eles serão o combustível da Fase 3 (IA preditiva).

4. **Validem o custo Z-API por restaurante no pricing** antes do go-live. É o único custo que escala linearmente com clientes.

5. **Próximo passo sugerido:** detalhar o **schema SQL completo** (DDL com índices, RLS e idempotência) e os **contratos de API REST** dos módulos MUST. Quer que eu avance para isso?

# FASE 4 — BANCO DE DADOS

> Documento de referência técnica. DDL pensado para durar anos e suportar milhões de pedidos sem reestruturação. Fiel ao MVP, mas com as fundações multi-tenant corretas — especialmente o modelo **Agência → Restaurantes**, que muda decisões estruturais e por isso foi tratado com prioridade.

---

### DECISÃO ARQUITETURAL DE ABERTURA (impacta tudo)

A introdução do conceito **Agência** obriga uma revisão do que o Arquiteto chamou de `Tenant`. Vou consolidar a nomenclatura definitiva:

```txt
ACCOUNT (antes "Tenant")  → unidade de cobrança + isolamento de dados
   ├── type = 'direct'     → dono de restaurante (1, raramente N lojas)
   └── type = 'agency'     → agência que opera VÁRIOS restaurantes de clientes

RESTAURANT                → a operação real (onde vivem clientes, pedidos, campanhas)
```

**Regra de ouro do isolamento:** `account_id` é a fronteira de segurança (RLS). `restaurant_id` é a fronteira de **escopo operacional** dentro da conta.

- Um restaurante direto = 1 account + 1 restaurant.
- Uma agência = 1 account + N restaurants.
- **Clientes e pedidos NUNCA são compartilhados entre restaurantes**, mesmo dentro da mesma agência. A base de cada restaurante é soberana.

Isso responde antecipadamente parte da Pergunta 14, mas detalho lá embaixo.

---

## PERGUNTA 11 — Modelagem Conceitual

#### Diagrama conceitual

```txt
                         ┌──────────────┐
                         │   ACCOUNT    │  (direct | agency)
                         │  (tenant)    │
                         └──────┬───────┘
            ┌───────────────────┼───────────────────────┐
            │ 1:N               │ 1:N                    │ 1:N
            ▼                   ▼                        ▼
       ┌─────────┐        ┌────────────┐          ┌─────────────┐
       │  USER   │        │ RESTAURANT │          │ SUBSCRIPTION│
       └────┬────┘        └─────┬──────┘          │  (billing)  │
            │ N:N               │                 └─────────────┘
            │ (acesso)          │ 1:N
            ▼                   ├──────────────► INTEGRATION
   ┌───────────────────┐        │
   │ USER_RESTAURANT   │        │ 1:N
   │     ACCESS        │        ▼
   └───────────────────┘   ┌──────────┐
                           │ CUSTOMER │◄───────────────┐
                           └────┬─────┘                │
                      ┌─────────┼──────────┐           │
                      │ 1:N     │ N:N      │ 1:N       │
                      ▼         ▼          ▼           │
                 ┌────────┐ ┌──────────┐ ┌──────────┐  │
                 │ ORDER  │ │ SEGMENT  │ │ CAMPAIGN │  │
                 └───┬────┘ │(via CUST_│ │  TARGET  │  │
                     │      │ SEGMENT) │ └────┬─────┘  │
                     │ 1:N  └──────────┘      │ 1:1    │
                     ▼                        ▼        │
               ┌──────────┐            ┌────────────┐  │
               │ORDER_ITEM│            │ MESSAGE_LOG│  │
               └──────────┘            └────────────┘  │
                                                      │
   RESTAURANT 1:N CAMPAIGN ─► CAMPAIGN_TARGET ─────────┘
                                                
   CONVERSION  liga  CAMPAIGN + CUSTOMER + ORDER  (a prova de ROI)
```

#### Entidades conceituais e propósito

| Entidade                      | Propósito de negócio                                            | Tipo    |
| ----------------------------- | --------------------------------------------------------------- | ------- |
| **Account**                   | Quem paga e é isolado. Direto ou Agência.                       | Núcleo  |
| **User**                      | Quem opera o painel. Pertence a uma Account.                    | Núcleo  |
| **UserRestaurantAccess**      | Quais restaurantes cada usuário enxerga (essencial p/ agência). | Núcleo  |
| **Restaurant**                | A operação. Dona da base de clientes.                           | Núcleo  |
| **Subscription**              | Plano/cobrança da conta (preço, status, nº WhatsApp).           | Suporte |
| **Integration**               | Fonte de dados (Anota AI / Cardápio Web).                       | Núcleo  |
| **Customer**                  | O ativo central. Telefone + histórico.                          | Núcleo  |
| **Order / OrderItem**         | Pedido importado e seus itens. Base do RFM.                     | Núcleo  |
| **Segment / CustomerSegment** | Classificação RFM (snapshot).                                   | Núcleo  |
| **Campaign / CampaignTarget** | Ação de marketing e seus alvos congelados.                      | Núcleo  |
| **MessageLog**                | Cada mensagem Z-API e seu status.                               | Núcleo  |
| **Conversion**                | Atribuição pedido↔campanha. A prova de ROI.                     | Núcleo  |

#### Regras conceituais invioláveis

1. Todo dado operacional pertence a **um** restaurante e a **uma** account.
2. `Customer.phone` é a chave natural de unificação **dentro de um restaurante** (não global).
3. `CampaignTarget` e `Conversion` são **imutáveis** após criação (auditoria de ROI).
4. Um usuário de agência pode ter acesso a 1..N restaurantes da sua account; um usuário direto normalmente vê todos da sua (única) account.

---

## PERGUNTA 12 — Modelagem Lógica PostgreSQL

#### Convenções de projeto

| Decisão          | Escolha                                           | Justificativa                                                                                                                                                                  |
| ---------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **PK**           | `UUID v7` (time-ordered)                          | Geração distribuída, sem enumeração, boa localidade de índice. Em tabelas de altíssimo volume (orders, message_log) o ordenamento temporal do v7 evita fragmentação de B-tree. |
| **Dinheiro**     | `numeric(12,2)`                                   | Precisão exata. Sem float em valores financeiros.                                                                                                                              |
| **Telefone**     | `varchar(16)` E.164                               | Padrão único de unificação.                                                                                                                                                    |
| **Datas**        | `timestamptz`                                     | Sempre UTC no banco; timezone do restaurante na aplicação.                                                                                                                     |
| **Status/enums** | `text` + `CHECK`                                  | Mais flexível que `ENUM` nativo (adicionar valor não exige `ALTER TYPE` com lock).                                                                                             |
| **Soft-delete**  | `deleted_at timestamptz`                          | Onde fizer sentido (account, user, restaurant).                                                                                                                                |
| **tenant_id**    | `account_id` em **todas** as tabelas operacionais | Fundamento do RLS e do particionamento futuro.                                                                                                                                 |

> Para UUID v7: usar extensão `pg_uuidv7` ou gerar na aplicação. Fallback `gen_random_uuid()` (v4) é aceitável no MVP.

---

#### 12.1 — Núcleo de identidade e tenancy

```sql
-- ============================================================
-- ACCOUNT (tenant) — unidade de cobrança e isolamento
-- ============================================================
CREATE TABLE account (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    type            TEXT NOT NULL DEFAULT 'direct'
                        CHECK (type IN ('direct','agency')),
    name            TEXT NOT NULL,
    legal_document  VARCHAR(18),              -- CNPJ/CPF
    status          TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','past_due','suspended','cancelled')),
    settings        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

-- ============================================================
-- SUBSCRIPTION — plano/cobrança (1 ativa por account)
-- ============================================================
CREATE TABLE subscription (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    account_id      UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    plan            TEXT NOT NULL CHECK (plan IN ('trial','starter','pro','agency')),
    status          TEXT NOT NULL DEFAULT 'trialing'
                        CHECK (status IN ('trialing','active','past_due','canceled')),
    whatsapp_numbers_limit  SMALLINT NOT NULL DEFAULT 1,
    restaurants_limit       SMALLINT NOT NULL DEFAULT 1,
    monthly_price   NUMERIC(10,2),
    current_period_end TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- USER — operadores do painel (pertence a uma account)
-- ============================================================
CREATE TABLE app_user (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    account_id      UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    email           CITEXT NOT NULL,
    password_hash   TEXT NOT NULL,
    name            TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'operator'
                        CHECK (role IN ('owner','admin','operator')),
    status          TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','invited','disabled')),
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT uq_user_email_per_account UNIQUE (account_id, email)
);

-- ============================================================
-- RESTAURANT — a operação (1 p/ direct, N p/ agency)
-- ============================================================
CREATE TABLE restaurant (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    account_id      UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    timezone        TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    whatsapp_number VARCHAR(16),              -- número Z-API dedicado
    settings        JSONB NOT NULL DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','paused','archived')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

-- ============================================================
-- USER_RESTAURANT_ACCESS — escopo de acesso (chave p/ agência)
-- ============================================================
CREATE TABLE user_restaurant_access (
    user_id         UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    restaurant_id   UUID NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    account_id      UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'operator'
                        CHECK (role IN ('manager','operator','viewer')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, restaurant_id)
);
```

> **Nota sobre `account_id` redundante** em `user_restaurant_access`: carregar `account_id` em tabelas-ponte simplifica RLS e evita JOINs extras na verificação de isolamento. É denormalização proposital e barata.

---

#### 12.2 — Integração e dados operacionais

```sql
-- ============================================================
-- INTEGRATION — fonte de dados por restaurante
-- ============================================================
CREATE TABLE integration (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    account_id      UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    restaurant_id   UUID NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    provider        TEXT NOT NULL
                        CHECK (provider IN ('anota_ai','cardapio_web','saipos','manual')),
    credentials     JSONB NOT NULL DEFAULT '{}',  -- criptografado na app
    status          TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','inactive','error')),
    last_sync_at    TIMESTAMPTZ,
    last_error      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CUSTOMER — o ativo central. Unificado por telefone/restaurante
-- ============================================================
CREATE TABLE customer (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    account_id      UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    restaurant_id   UUID NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    phone           VARCHAR(16) NOT NULL,         -- E.164
    name            TEXT,
    email           CITEXT,
    birth_date      DATE,                         -- p/ automação aniversário

    -- agregados (atualizados na ingestão; base do RFM e dashboard)
    first_order_at  TIMESTAMPTZ,
    last_order_at   TIMESTAMPTZ,
    total_orders    INTEGER NOT NULL DEFAULT 0,
    total_spent     NUMERIC(14,2) NOT NULL DEFAULT 0,
    avg_ticket      NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- RFM (snapshot do último cálculo)
    rfm_recency     SMALLINT,    -- 1..5
    rfm_frequency   SMALLINT,    -- 1..5
    rfm_monetary    SMALLINT,    -- 1..5
    current_segment_key TEXT
                        CHECK (current_segment_key IN
                            ('champions','new','at_risk','inactive', NULL)),
    segmented_at    TIMESTAMPTZ,

    consent_whatsapp BOOLEAN NOT NULL DEFAULT true,  -- LGPD / opt-out
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- unificação: 1 telefone = 1 cliente DENTRO do restaurante
    CONSTRAINT uq_customer_phone_per_restaurant UNIQUE (restaurant_id, phone)
);

-- ============================================================
-- ORDER — pedidos (PARTICIONADO POR MÊS)
-- ============================================================
CREATE TABLE orders (
    id              UUID NOT NULL DEFAULT uuid_generate_v7(),
    account_id      UUID NOT NULL,
    restaurant_id   UUID NOT NULL,
    customer_id     UUID NOT NULL,
    integration_id  UUID,
    external_id     TEXT NOT NULL,             -- id na origem (idempotência)
    total_amount    NUMERIC(12,2) NOT NULL,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    channel         TEXT,                      -- ifood, whatsapp, balcao...
    status          TEXT NOT NULL DEFAULT 'completed'
                        CHECK (status IN ('completed','canceled','pending')),
    ordered_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id, ordered_at)               -- PK inclui chave de partição
) PARTITION BY RANGE (ordered_at);

-- Idempotência: mesmo pedido da origem não duplica
CREATE UNIQUE INDEX uq_order_external
    ON orders (restaurant_id, integration_id, external_id, ordered_at);

-- Exemplo de partições (criadas via job mensal automático)
CREATE TABLE order_2025_01 PARTITION OF orders
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE order_2025_02 PARTITION OF orders
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- ... default para segurança
CREATE TABLE order_default PARTITION OF orders DEFAULT;

-- ============================================================
-- ORDER_ITEM — itens (base do Food Analytics futuro)
-- ============================================================
CREATE TABLE order_item (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    account_id      UUID NOT NULL,
    restaurant_id   UUID NOT NULL,
    order_id        UUID NOT NULL,
    ordered_at      TIMESTAMPTZ NOT NULL,      -- replica p/ join na partição
    product_name    TEXT NOT NULL,
    product_external_id TEXT,
    quantity        INTEGER NOT NULL DEFAULT 1,
    unit_price      NUMERIC(12,2) NOT NULL,
    total_price     NUMERIC(12,2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

> **Por que particionar `orders` por `ordered_at` mensal?** Com 10 mil restaurantes a ~30 pedidos/dia, são ~9 milhões de pedidos/mês. Particionar por mês mantém índices pequenos, acelera queries de janela temporal (RFM, dashboard, atribuição) e torna trivial arquivar histórico antigo. O particionamento por tempo casa perfeitamente com o padrão de consulta analítica.

---

#### 12.3 — Segmentação

```sql
-- ============================================================
-- SEGMENT — definição por restaurante (4 fixos no MVP)
-- ============================================================
CREATE TABLE segment (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    account_id      UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    restaurant_id   UUID NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    key             TEXT NOT NULL
                        CHECK (key IN ('champions','new','at_risk','inactive')),
    name            TEXT NOT NULL,
    rules           JSONB NOT NULL DEFAULT '{}',  -- abre p/ segmentação avançada futura
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_segment_key_per_restaurant UNIQUE (restaurant_id, key)
);

-- ============================================================
-- CUSTOMER_SEGMENT — snapshot de pertencimento (histórico)
-- ============================================================
CREATE TABLE customer_segment (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    account_id      UUID NOT NULL,
    restaurant_id   UUID NOT NULL,
    customer_id     UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
    segment_id      UUID NOT NULL REFERENCES segment(id) ON DELETE CASCADE,
    segment_key     TEXT NOT NULL,
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_current      BOOLEAN NOT NULL DEFAULT true
);
```

> O histórico de `customer_segment` (`is_current=false` nos antigos) é o que permitirá **análises de cohort e migração entre segmentos** na Fase 4 sem reestruturar nada. Custo hoje: baixíssimo. Valor futuro: altíssimo.

---

#### 12.4 — Campanhas, mensagens e conversão (o coração do ROI)

```sql
-- ============================================================
-- CAMPAIGN
-- ============================================================
CREATE TABLE campaign (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    account_id      UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    restaurant_id   UUID NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    segment_id      UUID REFERENCES segment(id),
    name            TEXT NOT NULL,
    message_template TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','scheduled','sending','sent','failed','canceled')),
    attribution_window_days SMALLINT NOT NULL DEFAULT 7,

    -- agregados materializados (dashboard sem recomputar)
    targets_count   INTEGER NOT NULL DEFAULT 0,
    sent_count      INTEGER NOT NULL DEFAULT 0,
    delivered_count INTEGER NOT NULL DEFAULT 0,
    read_count      INTEGER NOT NULL DEFAULT 0,
    failed_count    INTEGER NOT NULL DEFAULT 0,
    converted_count INTEGER NOT NULL DEFAULT 0,
    revenue_attributed NUMERIC(14,2) NOT NULL DEFAULT 0,

    scheduled_at    TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    created_by      UUID REFERENCES app_user(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CAMPAIGN_TARGET — snapshot imutável do alvo no disparo
-- ============================================================
CREATE TABLE campaign_target (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    account_id      UUID NOT NULL,
    restaurant_id   UUID NOT NULL,
    campaign_id     UUID NOT NULL REFERENCES campaign(id) ON DELETE CASCADE,
    customer_id     UUID NOT NULL REFERENCES customer(id),
    phone_snapshot  VARCHAR(16) NOT NULL,
    name_snapshot   TEXT,
    segment_snapshot TEXT,
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','sent','delivered','read','failed','converted')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_target_once UNIQUE (campaign_id, customer_id)  -- não dispara 2x
);

-- ============================================================
-- MESSAGE_LOG — cada mensagem Z-API (PARTICIONADO POR MÊS)
-- ============================================================
CREATE TABLE message_log (
    id              UUID NOT NULL DEFAULT uuid_generate_v7(),
    account_id      UUID NOT NULL,
    restaurant_id   UUID NOT NULL,
    campaign_target_id UUID NOT NULL,
    zapi_message_id TEXT,
    status          TEXT NOT NULL DEFAULT 'queued'
                        CHECK (status IN ('queued','sent','delivered','read','failed')),
    error_reason    TEXT,
    sent_at         TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE message_log_default PARTITION OF message_log DEFAULT;

-- lookup por id da Z-API (webhook de status)
CREATE INDEX idx_msglog_zapi ON message_log (zapi_message_id);

-- ============================================================
-- CONVERSION — a prova de ROI (imutável)
-- ============================================================
CREATE TABLE conversion (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    account_id      UUID NOT NULL,
    restaurant_id   UUID NOT NULL,
    campaign_id     UUID NOT NULL REFERENCES campaign(id) ON DELETE CASCADE,
    customer_id     UUID NOT NULL REFERENCES customer(id),
    order_id        UUID NOT NULL,
    order_ordered_at TIMESTAMPTZ NOT NULL,
    attributed_amount NUMERIC(12,2) NOT NULL,
    attributed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- 1 pedido conta p/ 1 campanha (evita inflar ROI)
    CONSTRAINT uq_conversion_order UNIQUE (order_id)
);
```

> **Decisões de ROI defensável:**
> - `campaign_target` carrega *snapshots* — o número não muda se o cliente mudar depois.
> - `conversion` tem `UNIQUE(order_id)`: um pedido nunca é atribuído a duas campanhas. ROI auditável e conservador (a favor da credibilidade).
> - Agregados materializados em `campaign` evitam recomputar o dashboard a cada acesso (cache + verdade no banco).

---

## PERGUNTA 13 — Índices para suportar 10 mil restaurantes

#### Princípio-mestre

> **Todo índice de tabela operacional começa por `restaurant_id` (ou `account_id`).** Em multi-tenant, o filtro de tenant está em 100% das queries. Índices que ignoram isso são inúteis em escala — o planner varre dados de outros tenants antes de filtrar.

#### Dimensionamento alvo

```txt
10.000 restaurantes
× ~5.000 clientes/restaurante      → 50 milhões de customers
× ~30 pedidos/cliente (histórico)  → centenas de milhões de orders
campanhas/mês × alvos              → dezenas de milhões de message_logs/mês
```

#### Índices por tabela

```sql
-- ---------- CUSTOMER (tabela mais consultada) ----------
-- Unificação por telefone (já é UNIQUE)
--   uq_customer_phone_per_restaurant (restaurant_id, phone)

-- Filtro por segmento (tela de clientes + montagem de campanha)
CREATE INDEX idx_customer_segment
    ON customer (restaurant_id, current_segment_key)
    WHERE deleted_at IS NULL;

-- Ordenação/listagem por recência (clientes inativos primeiro)
CREATE INDEX idx_customer_last_order
    ON customer (restaurant_id, last_order_at DESC NULLS LAST);

-- Automação de aniversário (busca por mês/dia)
CREATE INDEX idx_customer_birthday
    ON customer (restaurant_id, (EXTRACT(MONTH FROM birth_date)),
                                (EXTRACT(DAY FROM birth_date)))
    WHERE birth_date IS NOT NULL AND consent_whatsapp = true;

-- ---------- ORDERS (particionado; índices herdados por partição) ----------
-- Histórico de um cliente (RFM, perfil)
CREATE INDEX idx_order_customer
    ON orders (restaurant_id, customer_id, ordered_at DESC);

-- Atribuição de conversão: pedidos recentes de um cliente
--   (coberto pelo índice acima + poda de partição por ordered_at)

-- Dashboard de faturamento por período
CREATE INDEX idx_order_restaurant_date
    ON orders (restaurant_id, ordered_at DESC)
    WHERE status = 'completed';

-- ---------- ORDER_ITEM ----------
CREATE INDEX idx_order_item_order
    ON order_item (order_id);
-- Food analytics futuro: produtos mais vendidos
CREATE INDEX idx_order_item_product
    ON order_item (restaurant_id, product_name);

-- ---------- CAMPAIGN ----------
CREATE INDEX idx_campaign_restaurant
    ON campaign (restaurant_id, created_at DESC);
CREATE INDEX idx_campaign_status
    ON campaign (status) WHERE status IN ('scheduled','sending');

-- ---------- CAMPAIGN_TARGET ----------
-- Processamento do disparo (workers buscam pendentes)
CREATE INDEX idx_target_dispatch
    ON campaign_target (campaign_id, status)
    WHERE status = 'pending';
-- Atribuição: esse cliente foi alvo recente?
CREATE INDEX idx_target_customer
    ON campaign_target (restaurant_id, customer_id, created_at DESC);

-- ---------- MESSAGE_LOG (particionado) ----------
-- Webhook de status (já criado): idx_msglog_zapi
-- Relação com target
CREATE INDEX idx_msglog_target
    ON message_log (campaign_target_id, created_at DESC);

-- ---------- CONVERSION ----------
CREATE INDEX idx_conversion_campaign
    ON conversion (campaign_id);
CREATE INDEX idx_conversion_customer
    ON conversion (restaurant_id, customer_id, attributed_at DESC);

-- ---------- CUSTOMER_SEGMENT (histórico) ----------
CREATE INDEX idx_custseg_current
    ON customer_segment (restaurant_id, segment_key)
    WHERE is_current = true;

-- ---------- ACESSO / TENANCY ----------
CREATE INDEX idx_user_account ON app_user (account_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_restaurant_account ON restaurant (account_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ura_user ON user_restaurant_access (user_id);
CREATE INDEX idx_ura_restaurant ON user_restaurant_access (restaurant_id);
```

#### Por que índices parciais (`WHERE`)?

Reduzem drasticamente o tamanho do índice indexando só o que importa:
- `status = 'pending'` → o worker de disparo só busca pendentes.
- `is_current = true` → 1 linha por cliente em vez de todo o histórico.
- `deleted_at IS NULL` → ignora registros arquivados.

Em 10 mil restaurantes isso é a diferença entre um índice de 2 GB e um de 200 MB.

#### Estratégia de manutenção de índices

| Ação                                              | Frequência | Motivo                                  |
| ------------------------------------------------- | ---------- | --------------------------------------- |
| `autovacuum` agressivo em `customer` e `campaign` | contínuo   | tabelas com muito `UPDATE` de agregados |
| `pg_partman` (criação automática de partições)    | mensal     | orders e message_log                    |
| Detach + archive de partições > 24 meses          | trimestral | controle de custo                       |
| Monitorar `pg_stat_user_indexes`                  | mensal     | dropar índices não usados               |

---

## PERGUNTA 14 — Multi-tenant desde o início (com Agência)

> Esta é a decisão mais estrutural do projeto. Errar aqui custa um refactor doloroso. Vou ser exaustivo.

#### 14.1 — Escolha da estratégia: **Shared Database + Shared Schema + RLS**

Avaliei as três abordagens clássicas:

| Estratégia | Isolamento | Custo | Manutenção | Veredito |
|---|---|---|---|---|
| **DB por tenant** | Máximo | 🔴 Altíssimo (10k bancos) | 🔴 Inviável | ❌ |
| **Schema por tenant** | Alto | 🟠 Alto (10k schemas, migrations × 10k) | 🟠 Pesado | ❌ |
| **Shared schema + `tenant_id` + RLS** | Bom (garantido por RLS) | 🟢 Baixo | 🟢 1 migration p/ todos | ✅ **Escolhido** |

**Justificativa de arquiteto de dados:** com 10 mil restaurantes pequenos, schema-per-tenant gera um inferno operacional (cada migration roda 10k vezes; `pg_dump` gigante; catálogo do Postgres inchado). Shared schema com RLS dá isolamento forte no nível do banco e custo marginal por tenant próximo de zero. É exatamente o padrão de SaaS que escala para milhões de linhas sem reestruturar.

#### 14.2 — O modelo Account → Restaurant resolve a Agência

```txt
account (type='agency')   "Agência XPTO"
   ├── restaurant  "Pizzaria do João"      → customers, orders, campaigns próprios
   ├── restaurant  "Hamburgueria da Maria" → base 100% isolada da Pizzaria
   └── restaurant  "Sushi do Pedro"

account (type='direct')   "Pizzaria do João" (cliente direto)
   └── restaurant  "Pizzaria do João"
```

**Dois níveis de filtro, sempre:**

1. **Isolamento de segurança (RLS):** `account_id` = fronteira inviolável. Nenhuma query cruza accounts. Garantido pelo banco, não pela aplicação.
2. **Escopo operacional (aplicação):** dentro da account, filtra-se por `restaurant_id` conforme o `user_restaurant_access`. Uma agência com 50 restaurantes vê os 50; um operador específico pode ver só 5.

> **Insight crítico:** o RLS isola por **account**, não por restaurant. Isso é proposital — permite que a agência rode relatórios consolidados dos seus restaurantes (mesma account) com performance, enquanto a aplicação garante que cada usuário só veja os restaurantes a que tem acesso. Se RLS fosse por restaurant, relatórios de agência ficariam complexos.

#### 14.3 — Implementação do RLS

```sql
-- 1) Habilitar RLS nas tabelas operacionais
ALTER TABLE customer         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item       ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign         ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_target  ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion       ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration      ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant       ENABLE ROW LEVEL SECURITY;
-- ... todas as operacionais

-- 2) Política padrão: linha só é visível se pertence à account do contexto
CREATE POLICY tenant_isolation ON customer
    USING (account_id = current_setting('app.account_id')::uuid);

-- repetir o mesmo padrão para cada tabela:
CREATE POLICY tenant_isolation ON orders
    USING (account_id = current_setting('app.account_id')::uuid);
CREATE POLICY tenant_isolation ON campaign
    USING (account_id = current_setting('app.account_id')::uuid);
-- ... (idem demais)

-- 3) FORCE para que nem o owner da tabela escape (defesa em profundidade)
ALTER TABLE customer FORCE ROW LEVEL SECURITY;
```

#### 14.4 — Injeção do contexto de tenant (NestJS)

O isolamento depende de **sempre** setar o contexto antes de qualquer query. Isso vai num middleware/interceptor que roda em toda request autenticada:

```typescript
// TenantInterceptor — roda em toda request após o JWT guard
async setTenantContext(connection, accountId: string) {
  // SET LOCAL vale só para a transação atual → seguro com pool
  await connection.query(
    `SET LOCAL app.account_id = '${accountId}'`
  );
}
```

```txt
Request → JWT Guard (extrai account_id + user_id do token)
        → TenantInterceptor (SET LOCAL app.account_id)
        → abre transação
        → Controller/Service executam queries
            → RLS aplica filtro automaticamente
        → Aplicação adiciona WHERE restaurant_id IN (...) p/ escopo do usuário
```

**Pontos não-negociáveis:**
- Usar `SET LOCAL` dentro de transação (nunca `SET` global) — com connection pool, `SET` global vazaria contexto entre tenants. **Risco de vazamento de dados entre clientes.**
- O usuário de banco da aplicação **não** pode ter `BYPASSRLS`.
- Workers (BullMQ) também setam o contexto: cada job carrega `account_id` no payload e seta antes de processar.

#### 14.5 — Escopo de restaurante na aplicação

```typescript
// O JWT carrega os restaurantes acessíveis (resolvidos no login)
// Direct: todos da account | Agency: os de user_restaurant_access

// Em queries restaurant-scoped:
WHERE account_id = :accountId        -- RLS já garante, mas explícito ajuda o planner
  AND restaurant_id = ANY(:allowedRestaurantIds)
```

No login resolvemos uma vez:

```sql
-- Restaurantes que o usuário pode acessar
SELECT r.id
FROM restaurant r
LEFT JOIN user_restaurant_access ura
       ON ura.restaurant_id = r.id AND ura.user_id = :userId
WHERE r.account_id = :accountId
  AND (
    :userRole IN ('owner','admin')        -- vê tudo da account
    OR ura.user_id IS NOT NULL            -- ou tem acesso explícito
  )
  AND r.deleted_at IS NULL;
```

#### 14.6 — Matriz de papéis (Agência vs Direto)

| Papel                    | Contexto        | Enxerga                                         |
| ------------------------ | --------------- | ----------------------------------------------- |
| `owner` (direct)         | Account direta  | Seu(s) restaurante(s)                           |
| `owner`/`admin` (agency) | Account agência | **Todos** os restaurantes da agência            |
| `operator` (agency)      | Account agência | Apenas restaurantes em `user_restaurant_access` |
| `viewer`                 | Qualquer        | Read-only nos restaurantes liberados            |

#### 14.7 — Por que isso escala sem reestruturação

1. **Adicionar restaurante a uma agência** = 1 INSERT. Zero migration, zero schema novo.
2. **Migrations** rodam uma vez para 10 mil tenants.
3. **Particionamento por tempo** (orders, message_log) é ortogonal ao tenant — funciona igual para 1 ou 10 mil.
4. **Caminho de evolução para tenant gigante:** se uma agência virar um monstro (centenas de restaurantes, dezenas de milhões de pedidos), o `account_id`/`restaurant_id` em todas as tabelas permite **sub-particionar por hash de tenant** ou até promover para um shard dedicado — sem tocar no modelo lógico. Essa porta fica aberta de graça.

#### 14.8 — Camada de cache (Redis) e tenancy

Toda chave de cache **deve** ser namespaced por tenant para evitar vazamento:

```txt
dashboard:{account_id}:{restaurant_id}:roi:{period}
segment_counts:{restaurant_id}
ratelimit:zapi:{restaurant_id}          ← rate limit anti-ban POR número/restaurante
```

> O rate limit da Z-API é **por restaurante** (cada um tem seu número). Isso isola o risco de banimento: um restaurante disparando em excesso não derruba o número de outro. Crítico no modelo de agência, onde vários números convivem na mesma account.

---

### RESUMO DAS DECISÕES DESTA FASE

| Tema                    | Decisão                                                                   |
| ----------------------- | ------------------------------------------------------------------------- |
| Estratégia tenancy      | Shared schema + `account_id` + **RLS**                                    |
| Hierarquia              | `Account (direct\|agency)` → `Restaurant` → dados                         |
| Isolamento de segurança | RLS por `account_id` (no banco)                                           |
| Escopo operacional      | `restaurant_id` + `user_restaurant_access` (na app)                       |
| Contexto                | `SET LOCAL app.account_id` por transação                                  |
| PKs                     | UUID v7 (time-ordered)                                                    |
| Particionamento         | `orders` e `message_log` por mês (`RANGE`)                                |
| Índices                 | Sempre liderados por `restaurant_id`/`account_id`; parciais onde possível |
| ROI auditável           | snapshots imutáveis + `UNIQUE(order_id)` em conversion                    |
| Histórico p/ IA futura  | `customer_segment` versionado, `order_item` desde já                      |

---

### PRÓXIMO PASSO SUGERIDO

Posso avançar para a **Fase 5 — Camada de Consultas e Métricas**, entregando:

1. **Queries SQL prontas** do motor RFM (cálculo por percentil dentro de cada restaurante).
2. **Query de atribuição de conversão** (janela configurável, à prova de duplicação).
3. **Views/materialized views** do Dashboard de ROI (enviados → entregues → pedidos → R$).
4. **Queries de métricas de negócio**: LTV, Cohort de retenção, Churn, Ticket médio, Frequência de compra — já no modelo acima.
5. Estratégia de **refresh incremental** dessas materialized views via BullMQ.



# FASE 5 — UX & INTERFACE
### Product Designer / Frontend Engineer

> Documento de design do MVP "Máquina de Reativação via WhatsApp com ROI provado". Toda decisão de UI aqui serve a um princípio: **encurtar o caminho entre o dado e a prova de receita**. Nada de dashboard bonito que não vende. Tudo orientado a fazer o operador disparar campanha e ver dinheiro voltar.

---

### PRINCÍPIOS DE DESIGN (fundação)

Antes das telas, as regras que regem todas elas — herdadas de Stripe, Linear e HubSpot:

| Princípio                        | Aplicação prática                                                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **ROI sempre visível**           | O número de receita gerada nunca está a mais de 1 clique. Aparece no topo do Dashboard e no header de cada campanha.               |
| **Densidade com respiro**        | Tabelas densas (estilo Linear/Pipedrive), não cards soltos. Listas, não grids de cartões.                                          |
| **Cor com propósito**            | Neutros (zinc/slate) como base. Cor only para: status, ações primárias e o número de receita (verde). Nada de paleta de arco-íris. |
| **Estado vazio que ensina**      | Todo empty state explica o próximo passo e tem CTA. O onboarding vive nos empty states, não em tour modal.                         |
| **Ação primária única por tela** | Cada tela tem 1 ação dominante. No Dashboard é "Nova Campanha". Em Clientes é "Criar campanha para este segmento".                 |

**Design tokens propostos:**

```
Tipografia:   Inter (UI), tabular-nums em métricas
Base:         zinc-950 (texto) / zinc-50 (bg) / white (superfícies)
Primária:     indigo-600 (ações)
Sucesso/$:    emerald-600 (receita, ROI positivo)
Atenção:      amber-500 (em risco, past_due)
Perigo:       rose-600 (inativo, falha, ban)
Raio:         rounded-lg (8px) consistente
Sombra:       sutil, só em overlays (sem card-shadow pesado)
Sidebar:      colapsável, ícone+label, 240px → 64px
```

---

## PERGUNTA 15 — Telas do MVP

Validei a lista e organizei por **hierarquia de navegação** (não só lista plana). Adicionei estados que são "telas" na prática:

```txt
PÚBLICO
└── Login

APP (shell com sidebar + topbar de contexto de restaurante)
├── Dashboard              ★ a prova de ROI
├── Clientes               (lista + filtros por segmento)
│   └── Cliente            (perfil + histórico + timeline)
├── Campanhas              (lista + performance)
│   └── Nova Campanha      ★ o caminho do dinheiro (wizard 3 passos)
│   └── Campanha (detalhe) (resultado/ROI da campanha — derivada de "Nova")
├── Integrações           (status de conexão de dados)
└── Configurações         (conta, usuários, WhatsApp, restaurantes)
```

**Seletor de restaurante (topbar)** — componente crítico por causa do modelo Agência: um switcher no topo permite trocar de restaurante. Para conta `direct` aparece só o nome; para `agency` vira um dropdown com busca.

---

## PERGUNTA 16 — Detalhamento de cada tela

---

### 🔐 TELA 1 — Login

**Objetivo**
Autenticar o operador e resolver o contexto (account + restaurantes acessíveis) em segundos. Fricção zero.

**Jornada do usuário**
Operador chega → insere e-mail/senha → entra direto no Dashboard do restaurante (ou no seletor, se agência multi-restaurante).

**Componentes**
- Painel split: esquerda formulário, direita um painel escuro com o valor entregue (não imagem genérica — uma frase + métrica social: *"Restaurantes recuperam em média R$ X/mês em clientes inativos"*).
- Campos: e-mail, senha, "esqueci a senha".
- Botão primário único: "Entrar".
- Sem cadastro público (onboarding é assistido/comercial no MVP).

**Estados**
- `default` / `loading` (botão com spinner) / `error` (credencial inválida, inline, não toast) / `blocked` (conta `suspended` → mensagem para contatar suporte).

**UX**
- Enter submete. Foco automático no e-mail. Mensagens de erro específicas mas sem revelar se o e-mail existe (segurança).

**Métricas visíveis**
- Nenhuma métrica de negócio aqui. Apenas a prova social no painel lateral.

---

### 📊 TELA 2 — Dashboard

**Objetivo**
Ser a **prova de ROI** em uma olhada de 5 segundos. Responder: *"Quanto a plataforma me fez faturar?"* Esta tela combate o churn do segundo mês.

**Jornada do usuário**
Login → cai aqui → vê receita atribuída no topo → entende a saúde da base → decide criar próxima campanha.

**Componentes (de cima para baixo, em ordem de importância)**

1. **Header de impacto (faixa, não cards):**
   - `Receita recuperada` (emerald, número grande, tabular) — destaque máximo.
   - `Campanhas enviadas` · `Taxa de conversão` · `Clientes reativados` — secundários, na mesma linha.
   - Seletor de período (7d / 30d / 90d) à direita.

2. **Gráfico de receita atribuída no tempo** (Recharts, area chart suave) — receita gerada por campanhas ao longo do período. Linha única, emerald. Sem poluição.

3. **Saúde da base (distribuição RFM)** — barra horizontal segmentada (não pizza), mostrando: Campeões / Novos / Em Risco / Inativos com contagem e %. Cada segmento é clicável → leva para Clientes filtrado.

4. **Funil da última campanha** — mini-funil horizontal: Enviados → Entregues → Lidos → Pedidos → R$. Reforça a mecânica de valor.

5. **Tabela "Oportunidades agora"** — lista enxuta: segmentos com clientes prontos para reativar (ex.: *"127 clientes Em Risco — última compra há 30+ dias"*) com CTA inline "Criar campanha".

**Estados**
- `loading` (skeleton nas faixas e gráfico).
- `empty - sem dados` (integração recém-conectada, ainda sincronizando): mostra estado de onboarding → *"Estamos importando seus pedidos. Isso leva alguns minutos."* com progresso.
- `empty - sem campanha` (já tem clientes, nunca disparou): substitui o header por um CTA gigante *"Você tem 340 clientes inativos. Recupere-os →"*.
- `populated` (estado pleno).

**UX**
- A faixa de receita é o herói. Tudo gravita para "criar a próxima campanha".
- Botão primário fixo no topo direito: **"Nova Campanha"**.
- Nada de 8 cards de métrica vaidosa. Só o que aponta para receita ou ação.

**Métricas visíveis**
- Receita atribuída (R$) ★
- Taxa de conversão (%)
- Clientes reativados (n)
- Campanhas enviadas (n)
- Distribuição RFM da base
- Ticket médio dos pedidos atribuídos

---

### 👥 TELA 3 — Clientes

**Objetivo**
Mostrar o ativo (a base) de forma acionável. O destino natural daqui é **transformar um segmento em campanha**.

**Jornada do usuário**
Acessa → filtra por segmento (ex.: Inativos) → vê quantos são e o potencial → clica "Criar campanha para estes clientes".

**Componentes**
- **Barra de segmentos (tabs/chips no topo):** Todos · Campeões · Novos · Em Risco · Inativos — cada chip com contador. Esta é a navegação principal, não um dropdown escondido.
- **Busca** por nome/telefone.
- **Tabela densa (estilo Pipedrive):** colunas → Nome · Telefone · Segmento (badge colorido) · Último pedido (relativo: "há 12 dias") · Pedidos (n) · Total gasto (R$) · Ticket médio.
- **Linha clicável** → abre perfil do cliente.
- **Barra de ação contextual:** ao ter um segmento filtrado, aparece faixa fixa no rodapé: *"342 clientes em 'Inativos' · **Criar campanha** →"*.
- Ordenação por qualquer coluna. Paginação server-side.

**Estados**
- `loading` (skeleton de linhas).
- `empty - sem integração` → CTA para conectar fonte de dados.
- `empty - segmento vazio` → *"Nenhum cliente neste segmento agora. 👏"*.
- `populated`.
- `consent off` (linha com ícone discreto indicando opt-out de WhatsApp — não será incluído em campanhas).

**UX**
- O contador de cada segmento já comunica a oportunidade.
- Seleção de segmento → ação de campanha sempre a 1 clique.
- Badges de segmento usam cor com semântica fixa (Inativos = rose, Em Risco = amber, Campeões = emerald, Novos = indigo).

**Métricas visíveis**
- Contagem por segmento
- Total gasto / ticket médio / frequência por cliente
- Recência (último pedido)

---

### 👤 TELA 4 — Cliente (perfil)

**Objetivo**
Dar contexto completo de um cliente: quem é, o que comprou, como reage a campanhas. Suporte à decisão e à confiança no dado.

**Jornada do usuário**
Vem da lista → entende o histórico → eventualmente dispara ação individual ou só valida o dado.

**Componentes**
- **Header do cliente:** nome, telefone (E.164 formatado), badge de segmento atual, status de consentimento WhatsApp.
- **Faixa de KPIs do cliente:** Total gasto · Nº de pedidos · Ticket médio · Cliente desde · Última compra. Em linha, tabular-nums.
- **Scores RFM:** três mini-indicadores (R, F, M) de 1–5 — visual de barra/dots, não números crus.
- **Timeline unificada (coluna central):** ordem cronológica reversa misturando:
  - 🛒 Pedidos (valor, itens, canal, data)
  - 📨 Mensagens de campanha recebidas (status: entregue/lida)
  - ✅ Conversões atribuídas (pedido X gerado pela campanha Y)
  - 🔄 Mudanças de segmento (entrou em "Em Risco")
- **Painel lateral:** dados de contato, aniversário, integração de origem.

**Estados**
- `loading` / `populated` / `sem pedidos` (cliente importado sem histórico — raro).

**UX**
- A timeline é o coração — conta a história "campanha → pedido", reforçando o ROI no nível individual.
- Conversões destacadas em emerald na timeline: prova visual de que funcionou.

**Métricas visíveis**
- LTV (total gasto), frequência, ticket médio, recência
- RFM scores
- Receita atribuída a campanhas deste cliente

---

### 📣 TELA 5 — Campanhas

**Objetivo**
Listar campanhas com sua performance, provando recorrência de valor. Histórico auditável de ROI.

**Jornada do usuário**
Acessa → vê campanhas passadas e o que cada uma rendeu → cria nova ou abre uma para detalhar.

**Componentes**
- **Header:** título + botão primário **"Nova Campanha"**.
- **Faixa-resumo:** total de campanhas · receita total atribuída · conversão média.
- **Tabela densa:** Nome · Segmento-alvo · Status (badge) · Enviados · Entregues (%) · Conversões · **Receita (R$)** ★ · Data.
  - Coluna Receita em emerald, com ênfase.
  - Status: draft (zinc), sending (indigo pulsante), sent (neutro), failed (rose).
- **Linha clicável** → detalhe da campanha.
- Filtro por status e período.

**Estados**
- `loading`.
- `empty` (primeira vez) → estado de onboarding forte: *"Crie sua primeira campanha e recupere clientes inativos"* + CTA. Pode pré-sugerir o segmento Inativos.
- `populated`.
- `sending` (campanha em disparo) → linha com barra de progresso ao vivo (X/Y enviados), atualizada via polling.

**UX**
- Foco na coluna Receita: o operador escaneia "quanto cada campanha rendeu".
- Campanha em envio mostra progresso real (transparência sobre rate-limit anti-ban).

**Métricas visíveis**
- Receita atribuída por campanha ★
- Taxa de entrega, leitura, conversão
- Volume enviado

---

### ✍️ TELA 6 — Nova Campanha (wizard 3 passos)

**Objetivo**
Levar o operador do nada ao disparo em **menos de 2 minutos**, sem erro e sem medo. Esta é a tela que gera dinheiro — a mais importante do produto.

**Jornada do usuário**
"Nova Campanha" → escolhe segmento → escreve mensagem (com preview) → revisa e dispara → vê confirmação e acompanha.

**Componentes — wizard em 3 passos (stepper horizontal no topo):**

**Passo 1 — Público**
- Seleção de segmento (cards-radio horizontais, não dropdown): Campeões / Novos / Em Risco / Inativos, cada um com contagem de clientes e descrição curta.
- Ao selecionar: mostra *"Você vai alcançar **X clientes**"* (exclui quem deu opt-out, indicando: *"Y excluídos por opt-out"*).
- Janela de atribuição (default 7 dias, editável discretamente) com tooltip explicando: *"Pedidos feitos em até 7 dias após a mensagem contam como conversão."*

**Passo 2 — Mensagem**
- **Editor à esquerda / preview de celular WhatsApp à direita** (split). O preview é decisivo — vê exatamente como chega.
- Inserção de variáveis por chips: `{nome}` `{restaurante}`. Clica e insere no cursor.
- Contador de caracteres.
- **Sugestões de template** (pills): "Reativação com desconto", "Sentimos sua falta", "Oferta do dia" — preenchem o editor (acelera e ensina copy que converte).
- Aviso anti-ban discreto: dica de boas práticas (personalize, não use só link).

**Passo 3 — Revisão & Disparo**
- Resumo: segmento, nº de destinatários, preview final, janela de atribuição.
- **Estimativa de tempo de envio** (por causa do rate-limit): *"O envio para 342 clientes levará ~25 min para proteger seu número."* — transparência sobre o anti-ban, transformando limitação em feature de segurança.
- Opção: "Enviar agora" ou "Agendar".
- Botão primário: **"Disparar campanha"** com confirmação (dialog: *"Enviar para 342 clientes?"*).

**Estados**
- Por passo: `incompleto` (botão avançar desabilitado), `válido`.
- `dispatching` → após confirmar, vai para tela de detalhe da campanha com progresso ao vivo.
- `error` (Z-API indisponível / número não conectado) → bloqueia disparo com mensagem clara e link para Integrações/Config.
- `no consent base` (segmento sem ninguém com opt-in) → avisa e impede.

**UX**
- Stepper sempre visível, permite voltar sem perder dados.
- O preview de WhatsApp à direita atualiza em tempo real conforme digita.
- Nenhuma decisão técnica exposta sem explicação amigável.
- A estimativa de tempo gerencia expectativa e educa sobre o porquê do envio gradual.

**Métricas visíveis**
- Nº de destinatários (e excluídos por opt-out)
- Estimativa de tempo de envio
- Preview fiel da mensagem

---

### 🔌 TELA 7 — Integrações

**Objetivo**
Conectar a fonte de dados (Anota AI / Cardápio Web) e dar **visibilidade da saúde da sincronização**. Sem isso, não há CRM — é o elo 1 do dinheiro.

**Jornada do usuário**
Configura no onboarding → conecta integração → vê status "sincronizando" → depois "ativo, último sync há X min".

**Componentes**
- **Lista de provedores disponíveis** (linhas, não cards excessivos): Anota AI, Cardápio Web (ativos no MVP); Saipos, iFood (badge "em breve", desabilitados).
- Cada provedor conectado mostra: status (ativo/erro/inativo), último sync, nº de pedidos importados, nº de clientes criados.
- **Fluxo de conexão** (dialog/drawer): inserir credenciais/token, testar conexão, salvar.
- **Card de saúde da sincronização** (único card justificável): pedidos importados nas últimas 24h, gráfico simples.
- Em caso de erro: mensagem clara + última falha + botão "Reconectar".

**Estados**
- `não conectado` → estado de onboarding com instruções passo a passo.
- `connecting` / `testing` (validando credencial).
- `active` (verde, último sync recente).
- `syncing` (importação inicial em andamento, com progresso).
- `error` (rose, com motivo e CTA de reconexão).

**UX**
- Status honesto e em tempo quase real — o operador precisa confiar que os dados estão entrando.
- Erro nunca é genérico: diz o que houve e o que fazer.

**Métricas visíveis**
- Último sync (relativo)
- Pedidos/clientes importados
- Volume de ingestão nas últimas 24h

---

### ⚙️ TELA 8 — Configurações

**Objetivo**
Gerenciar conta, usuários, número de WhatsApp e (para agências) restaurantes. Tela de baixa frequência mas alta criticidade (WhatsApp = canal de receita).

**Jornada do usuário**
Acessa por necessidade pontual → ajusta dado → sai. Não deve roubar atenção do fluxo principal.

**Componentes — navegação por abas laterais (sub-nav):**

1. **Conta** — dados da empresa, plano/assinatura, status de cobrança.
2. **WhatsApp / Z-API** ★ — número conectado, status de saúde do número (conectado/desconectado), QR code/conexão, indicador de "aquecimento" se aplicável. Crítico: o operador precisa saber se o número está vivo antes de disparar.
3. **Usuários & Acessos** — lista de usuários, papéis (owner/admin/operator), convites. Para agência: matriz de quais restaurantes cada usuário acessa.
4. **Restaurantes** (só agency / multi-loja) — lista de restaurantes da conta, adicionar/arquivar.
5. **Preferências** — fuso horário, dados do restaurante usados em `{restaurante}`.

**Estados**
- `WhatsApp desconectado` (rose, alerta no topo de toda a app até reconectar — porque trava campanhas).
- `past_due` (cobrança) → banner não-bloqueante.
- Permissões: operator não vê abas de Conta/Cobrança.

**UX**
- Status do WhatsApp é o item mais crítico aqui — sempre visível, com indicador de saúde claro.
- Quando o número cai, um alerta global aparece no shell (não só nesta tela), pois compromete a operação.

**Métricas visíveis**
- Status e saúde do número WhatsApp
- Plano / limites (nº de números, nº de restaurantes)
- Uso vs. limite do plano

---

## PERGUNTA 17 — User Flow completo

### Fluxo macro de navegação

```txt
                         ┌──────────┐
                         │  LOGIN   │
                         └────┬─────┘
                              │ autentica + resolve account/restaurantes
                              ▼
                  ┌───────────────────────┐
            ┌─────┤   É agência multi?    ├─────┐
         não│     └───────────────────────┘     │sim
            ▼                                    ▼
   ┌────────────────┐                  ┌──────────────────┐
   │ Tem integração?│                  │ SELETOR DE       │
   └───┬────────┬───┘                  │ RESTAURANTE      │
   não │        │ sim                  └────────┬─────────┘
       ▼        ▼                               │
 ┌──────────┐  ┌───────────┐                    ▼
 │ONBOARDING│  │ DASHBOARD │◄───────────(contexto setado)
 │Integração│  └─────┬─────┘
 └────┬─────┘        │
      │ conecta      │ ação primária
      └──────────────┤
                     ▼
        ┌────────────────────────────┐
        │   FLUXO DO DINHEIRO (core)  │
        └────────────────────────────┘
```

### Fluxo 1 — Onboarding até primeiro valor (caminho crítico de ativação)

```txt
LOGIN
  ↓
DASHBOARD (estado: sem dados)
  ↓ "Conecte sua fonte de dados"
INTEGRAÇÕES
  ↓ escolhe Anota AI / Cardápio Web
  ↓ insere credencial → testa → conecta
  ↓ [sistema sincroniza em background]
DASHBOARD (estado: sincronizando → populado)
  ↓ vê base + "340 clientes inativos"
  ↓ CTA "Recupere-os"
NOVA CAMPANHA
  ↓ (ver Fluxo 2)
  ↓
PRIMEIRA CAMPANHA DISPARADA  ← momento de ativação ("aha")
  ↓ aguarda janela de atribuição
DASHBOARD (estado: ROI visível)  ← momento de retenção
```

> **Métrica norte do onboarding:** tempo entre login inicial e primeira campanha disparada. Meta: < 10 minutos.

### Fluxo 2 — Criar e disparar campanha (o caminho do dinheiro)

```txt
[Entrada A: Dashboard "Oportunidades"]
[Entrada B: Clientes → segmento filtrado → "Criar campanha"]
[Entrada C: Campanhas → "Nova Campanha"]
        │
        ▼
NOVA CAMPANHA — Passo 1 (Público)
        │ segmento pré-selecionado se veio de B
        │ mostra "X clientes alcançáveis"
        ▼
NOVA CAMPANHA — Passo 2 (Mensagem)
        │ escolhe template OU escreve
        │ preview WhatsApp ao vivo
        │ insere {nome}
        ▼
NOVA CAMPANHA — Passo 3 (Revisão)
        │ vê destinatários + estimativa de tempo
        ▼
   [Dialog: confirmar disparo?]
        │ sim
        ▼
   Validação: WhatsApp conectado? base com opt-in?
        │ falha → erro + CTA p/ Configurações
        │ ok
        ▼
CAMPANHA (detalhe) — status "sending"
        │ progresso ao vivo (X/Y) — rate-limited
        ▼
CAMPANHA (detalhe) — status "sent"
        │ aguarda webhooks de status (entregue/lido)
        │ aguarda janela de atribuição (pedidos)
        ▼
ROI atualizado → reflete em Dashboard + lista de Campanhas
```

### Fluxo 3 — Análise de cliente

```txt
CLIENTES (lista)
  ↓ filtra por segmento OU busca
  ↓ clica numa linha
CLIENTE (perfil)
  ↓ vê timeline: pedidos + mensagens + conversões
  ↓ entende histórico campanha→pedido
  ↓ (volta para lista ou cria campanha do segmento)
```

### Fluxo 4 — Troca de contexto (agência)

```txt
Qualquer tela
  ↓ clica no seletor de restaurante (topbar)
  ↓ busca/escolhe outro restaurante
  ↓ [contexto recarrega: account_id mantém, restaurant_id muda]
Dashboard do novo restaurante
```

### Mapa de navegação persistente (sidebar)

```txt
┌─────────────────┐
│  [Logo]         │
│  [Restaurante▼] │ ← seletor (topbar/contexto)
├─────────────────┤
│ 📊 Dashboard    │
│ 👥 Clientes     │
│ 📣 Campanhas    │
│ 🔌 Integrações  │
│ ⚙️ Configurações│
├─────────────────┤
│[Alerta WhatsApp]│ ← aparece só se número caiu
│ [Usuário ▼]     │
└─────────────────┘
```

---

## PERGUNTA 18 — Prompts Lovable por tela

> Prompts prontos para colar no Lovable. Cada um carrega o sistema de design comum. **Comece sempre pelo Prompt 0** (setup), depois as telas na ordem do caminho do dinheiro.

---

### 🧱 PROMPT 0 — Setup do Design System & Shell

```
Crie a base de um aplicativo SaaS B2B chamado "Fidelizza" — um CRM de 
reativação de clientes para restaurantes delivery. Inspiração visual: 
Stripe, Linear e HubSpot. Profissional, denso, limpo, sem aparência genérica.

STACK: React + Vite, Tailwind CSS, shadcn/ui, Recharts, lucide-react icons.

DESIGN SYSTEM (configure em tailwind + tokens):
- Fonte: Inter. Use tabular-nums em todos os números/métricas.
- Cores base: zinc (texto zinc-950, bg zinc-50, superfícies brancas).
- Primária: indigo-600 (botões e ações).
- Sucesso/Receita: emerald-600 (sempre que mostrar dinheiro/ROI positivo).
- Atenção: amber-500. Perigo: rose-600.
- Use cor com PARCIMÔNIA. Base neutra. Cor só para status, ações e receita.
- Bordas: rounded-lg consistente. Sombras sutis só em overlays.
- NÃO use cards em excesso. Prefira listas e tabelas densas estilo Linear.

LAYOUT SHELL (AppLayout):
- Sidebar fixa à esquerda (240px, colapsável para 64px só ícones):
  Logo no topo. Itens: Dashboard, Clientes, Campanhas, Integrações, 
  Configurações (cada um com ícone lucide). Item ativo destacado com 
  fundo indigo-50 e barra lateral indigo-600.
  No rodapé da sidebar: menu do usuário (avatar + nome + dropdown logout).
- Topbar:
  À esquerda, um SELETOR DE RESTAURANTE (dropdown com busca) — mostra o 
  restaurante ativo. Para conta simples mostra só o nome; para agência, 
  dropdown pesquisável.
  À direita, espaço para ação primária da página.
- Banner de alerta global (oculto por padrão): faixa rose-50 no topo do 
  conteúdo, usada quando o WhatsApp está desconectado: "⚠️ Seu WhatsApp 
  está desconectado. Campanhas estão pausadas. Reconectar →".

Crie componentes reutilizáveis: PageHeader (título + subtítulo + slot de 
ação), StatTile (rótulo + número grande tabular + variação opcional), 
StatusBadge (variantes: success, warning, danger, neutral, info), 
EmptyState (ícone + título + descrição + CTA), DataTable (densa, 
ordenável, com skeleton de loading).

Não crie conteúdo de páginas ainda — só o shell, o design system e os 
componentes base. Use dados mockados quando necessário.
```

---

### 🔐 PROMPT 1 — Login

```txt
Crie a tela de Login do Fidelizza usando o design system já definido.

LAYOUT: split screen em duas colunas (full height).
- Coluna ESQUERDA (branca, 45%): centralizado verticalmente.
  Logo no topo. Título "Entrar na sua conta". 
  Formulário: campo Email, campo Senha (com toggle mostrar/ocultar), 
  link "Esqueci minha senha" alinhado à direita. 
  Botão primário full-width "Entrar" (indigo-600).
  Foco automático no email. Enter submete.
- Coluna DIREITA (zinc-950, 55%): painel escuro de prova de valor.
  NÃO use imagem genérica. Use uma frase de impacto em branco:
  "Transforme sua base de clientes em faturamento recorrente."
  Abaixo, uma métrica social destacada em emerald-400: 
  "Restaurantes recuperam em média R$ 4.200/mês em clientes inativos."
  Um pequeno gráfico decorativo de linha (Recharts) ascendente em 
  emerald, sutil, ao fundo.

ESTADOS:
- loading: botão "Entrar" com spinner, campos desabilitados.
- error: alerta inline acima do formulário (rose), texto "Email ou senha 
  incorretos." — não use toast, não revele se o email existe.
- blocked: se conta suspensa, mensagem "Sua conta está suspensa. Fale com 
  o suporte." com link.

Sem cadastro público. Mobile: empilha colunas, painel de valor vira um 
header compacto no topo.
```

---

### 📊 PROMPT 2 — Dashboard

```txt
Crie a tela Dashboard do Fidelizza — a tela mais importante: prova de ROI 
em 5 segundos. Use o AppLayout e o design system.

PageHeader: título "Dashboard", subtítulo com nome do restaurante. 
À direita: seletor de período (segmented control 7d/30d/90d) e botão 
primário "Nova Campanha" (indigo-600, ícone +).

CONTEÚDO (de cima para baixo):

1. FAIXA DE IMPACTO (não use cards separados; uma faixa horizontal dividida):
   - Métrica HERÓI à esquerda: "Receita recuperada" — número grande em 
     emerald-600, tabular, ex: "R$ 4.280" + variação vs período anterior 
     (ex: "+18%" em emerald com seta).
   - Três métricas secundárias menores na mesma faixa, separadas por 
     divisores verticais: "Conversão" (12,4%), "Clientes reativados" (34), 
     "Campanhas enviadas" (6).

2. GRÁFICO de receita atribuída no tempo (Recharts AreaChart):
   - Uma única série emerald, gradiente suave, sem poluição.
   - Eixo X = datas, eixo Y = R$. Tooltip limpo. Altura ~280px.
   - Título discreto "Receita gerada por campanhas".

3. SAÚDE DA BASE (RFM) — barra horizontal segmentada (NÃO pizza):
   - Uma barra única dividida em 4 segmentos proporcionais: 
     Campeões (emerald), Novos (indigo), Em Risco (amber), Inativos (rose).
   - Abaixo, legenda com contagem e % de cada. Cada item é CLICÁVEL 
     (leva para /clientes filtrado pelo segmento).

4. FUNIL DA ÚLTIMA CAMPANHA — funil horizontal compacto:
   Enviados → Entregues → Lidos → Pedidos → Receita. 
   Cada etapa com número e % de conversão entre etapas. Última etapa 
   (Receita) em emerald.

5. TABELA "Oportunidades agora": lista enxuta de segmentos acionáveis.
   Colunas: Segmento, Nº de clientes, Descrição (ex: "última compra há 
   30+ dias"), e botão inline "Criar campanha" em cada linha.

ESTADOS:
- loading: skeletons na faixa, gráfico e tabela.
- empty (integração sincronizando): substitua tudo por um EmptyState 
  central: "Estamos importando seus pedidos. Isso leva alguns minutos." 
  com barra de progresso.
- empty (tem clientes, nunca disparou): substitua a faixa de impacto por 
  um bloco CTA grande emerald-50: "Você tem 340 clientes inativos. 
  Recupere-os agora →" com botão.
- populated: estado completo acima.

Use dados mockados realistas de um restaurante delivery.
```

---

### 👥 PROMPT 3 — Clientes

```txt
Crie a tela Clientes do Fidelizza usando AppLayout e design system.

PageHeader: título "Clientes", subtítulo "Sua base de clientes do 
restaurante". À direita: campo de busca (por nome ou telefone).

BARRA DE SEGMENTOS (logo abaixo do header) — navegação principal, em chips 
clicáveis horizontais, cada um com contador:
[ Todos 1.240 ] [ Campeões 89 ] [ Novos 156 ] [ Em Risco 342 ] [ Inativos 653 ]
Chip ativo destacado. Cores semânticas nos badges: Campeões=emerald, 
Novos=indigo, Em Risco=amber, Inativos=rose.

TABELA DENSA (estilo Pipedrive/Linear), ordenável por coluna:
Colunas: Nome | Telefone | Segmento (StatusBadge colorido) | 
Último pedido (relativo: "há 12 dias") | Pedidos (n) | 
Total gasto (R$, tabular) | Ticket médio (R$).
- Linha inteira clicável → navega para /clientes/:id.
- Clientes com opt-out de WhatsApp: ícone discreto de sino cortado + 
  tooltip "Não recebe campanhas (opt-out)".
- Paginação no rodapé.

BARRA DE AÇÃO CONTEXTUAL (faixa fixa no rodapé da tela, aparece quando um 
segmento específico está filtrado):
"342 clientes em 'Em Risco'" + botão primário "Criar campanha para estes 
clientes →" (navega para Nova Campanha com segmento pré-selecionado).

ESTADOS:
- loading: skeleton de linhas.
- empty (sem integração): EmptyState "Conecte uma fonte de dados para ver 
  seus clientes" + CTA "Ir para Integrações".
- empty (segmento vazio): "Nenhum cliente neste segmento agora 👏".
- populated.

Dados mockados realistas de clientes de delivery brasileiros.
```

---

### 👤 PROMPT 4 — Cliente (perfil)

```txt
Crie a tela de perfil do Cliente (/clientes/:id) do Fidelizza, usando 
AppLayout e design system. Inspiração: perfil de contato do HubSpot/Intercom.

LAYOUT em duas colunas:

HEADER (largura total):
- Avatar/inicial, Nome do cliente, telefone formatado (+55 11 9...), 
  StatusBadge do segmento atual, indicador de consentimento WhatsApp 
  (verde "Recebe campanhas" ou cinza "Opt-out").
- Botão "Voltar" para a lista.

FAIXA DE KPIs DO CLIENTE (abaixo do header, sem cards soltos — uma faixa 
dividida): Total gasto (emerald, tabular) | Nº de pedidos | Ticket médio | 
Cliente desde | Última compra (relativa).

COLUNA CENTRAL (principal) — RFM + TIMELINE:
- Mini-bloco RFM: três indicadores R, F, M com escala visual de 1 a 5 
  (use 5 dots preenchidos ou mini-barra), rótulos "Recência", 
  "Frequência", "Valor".
- TIMELINE unificada cronológica reversa, cada item com ícone e cor:
  🛒 Pedido — "Pedido de R$ 64,90 · 3 itens · via iFood" + data.
  📨 Mensagem — "Campanha 'Volte e ganhe 15%' entregue/lida" + data.
  ✅ Conversão (DESTAQUE em emerald) — "Pedido de R$ 72,00 gerado pela 
     campanha X" + data.
  🔄 Segmento — "Entrou em 'Em Risco'" + data.
  Use uma linha vertical conectando os eventos (timeline visual).

COLUNA LATERAL (direita, estreita):
- Bloco "Detalhes": email, aniversário, integração de origem 
  (ex: "Anota AI"), data de cadastro.

ESTADOS:
- loading: skeletons.
- sem pedidos: timeline mostra só eventos de cadastro/segmento.

Dados mockados coerentes (os números dos KPIs batem com a timeline).
```

---

### 📣 PROMPT 5 — Campanhas (lista)

```txt
Crie a tela Campanhas do Fidelizza usando AppLayout e design system.

PageHeader: título "Campanhas", subtítulo "Histórico e performance". 
À direita: botão primário "Nova Campanha" (indigo-600, ícone +).

FAIXA-RESUMO (abaixo do header, faixa dividida — sem cards soltos):
Total de campanhas | Receita total atribuída (emerald, destaque) | 
Conversão média (%).

FILTROS: dropdown de status + seletor de período.

TABELA DENSA, ordenável:
Colunas: Nome | Segmento-alvo (badge) | Status (StatusBadge) | 
Enviados | Entregues (n e %) | Conversões | RECEITA (R$, emerald, ênfase) | 
Data.
- Status variantes: draft (neutral/zinc), scheduled (info), 
  sending (info, com animação/pulse), sent (neutral), failed (danger).
- Para campanhas em "sending": mostrar uma mini barra de progresso na 
  linha (ex: "182/342 enviados") atualizada.
- Linha clicável → /campanhas/:id (detalhe).

ESTADOS:
- loading: skeleton de linhas.
- empty (primeira campanha): EmptyState forte e motivador: ícone, 
  "Crie sua primeira campanha", "Você tem 653 clientes inativos esperando 
  para voltar. Recupere-os com uma mensagem no WhatsApp." + botão primário 
  "Criar primeira campanha".
- populated.

Dados mockados realistas (nomes de campanha como "Reativação Inativos 
Outubro", "Sentimos sua falta", "Oferta de quinta").
```

---

### ✍️ PROMPT 6 — Nova Campanha (wizard 3 passos)

```txt
Crie a tela Nova Campanha do Fidelizza — a tela que gera receita. Wizard de 
3 passos. Use AppLayout e design system. Inspiração: fluxos da Stripe.

STEPPER horizontal no topo (3 passos): "1. Público" · "2. Mensagem" · 
"3. Revisão". Passo atual destacado, passos concluídos com check.
Botões de navegação no rodapé: "Voltar" e "Continuar" (primário). No último 
passo, "Continuar" vira "Disparar campanha".

PASSO 1 — PÚBLICO:
- Título "Para quem você quer enviar?".
- 4 cards-radio HORIZONTAIS selecionáveis (não dropdown): Campeões, Novos, 
  Em Risco, Inativos. Cada card: nome, contagem de clientes, descrição 
  curta (ex: Inativos: "Não pedem há mais de 60 dias"). Card selecionado 
  com borda indigo-600 e fundo indigo-50.
- Ao selecionar, mostrar destaque: "Você vai alcançar 653 clientes" + 
  linha menor "12 excluídos por opt-out de WhatsApp".
- Campo discreto "Janela de atribuição" com valor default "7 dias" e 
  tooltip: "Pedidos feitos em até 7 dias após a mensagem contam como 
  conversão desta campanha."

PASSO 2 — MENSAGEM (layout split):
- ESQUERDA: editor.
  Pills de templates sugeridos (clicáveis, preenchem o editor): 
  "Reativação com desconto", "Sentimos sua falta", "Oferta do dia".
  Textarea grande para a mensagem. 
  Chips de variáveis acima: [{nome}] [{restaurante}] — clicar insere no 
  cursor. Contador de caracteres no canto.
  Dica discreta (amber-50): "💡 Personalize com {nome} e evite enviar só 
  links — protege seu número."
- DIREITA: PREVIEW realista de celular WhatsApp.
  Mockup de tela de WhatsApp (fundo padrão WhatsApp, balão de mensagem 
  verde-claro recebido) renderizando a mensagem com as variáveis 
  substituídas por exemplo ({nome}→"Maria"). Atualiza em tempo real 
  conforme digita.

PASSO 3 — REVISÃO:
- Resumo em lista: Segmento (653 clientes), Janela de atribuição (7 dias), 
  Preview final da mensagem.
- BLOCO de estimativa (indigo-50): "⏱️ O envio para 653 clientes levará 
  ~45 min. Enviamos gradualmente para proteger seu número de WhatsApp 
  contra bloqueios."
- Opção de envio: radio "Enviar agora" / "Agendar" (com datepicker se 
  agendar).
- Botão primário "Disparar campanha" abre DIALOG de confirmação: 
  "Enviar para 653 clientes? Esta ação não pode ser desfeita." 
  [Cancelar] [Confirmar e enviar].

ESTADOS:
- Botão "Continuar" desabilitado enquanto o passo está incompleto.
- error (ao tentar disparar): se WhatsApp desconectado, dialog de erro 
  "Seu WhatsApp não está conectado. Conecte antes de disparar." + CTA 
  "Ir para Configurações".
- dispatching: após confirmar, navega para detalhe da campanha mostrando 
  progresso ao vivo.

Mobile: stepper compacto, split do passo 2 empilha (editor em cima, preview 
embaixo).
```

---

### 📈 PROMPT 6B — Campanha (detalhe / resultado)

```txt
Crie a tela de detalhe de Campanha (/campanhas/:id) do Fidelizza — mostra o 
resultado e o ROI de uma campanha. Use AppLayout e design system.

HEADER: nome da campanha, StatusBadge, data de envio, segmento-alvo. 
Botão "Voltar".

Se status = "sending": mostrar barra de progresso grande ao vivo 
("182 de 342 enviados") + nota "Enviando gradualmente para proteger seu 
número".

FUNIL DE PERFORMANCE (horizontal, destaque central):
Alvos → Enviados → Entregues → Lidos → Pedidos → Receita.
Cada etapa: número grande + % de conversão para a próxima. Etapa final 
"Receita" em emerald-600, número grande.

FAIXA DE KPIs: Taxa de entrega | Taxa de leitura | Taxa de conversão | 
Receita atribuída (emerald) | Ticket médio dos pedidos gerados.

MENSAGEM ENVIADA: bloco mostrando o texto exato da mensagem que foi 
disparada (read-only).

TABELA DE DESTINATÁRIOS: Nome | Telefone | Status da mensagem (StatusBadge: 
enviado/entregue/lido/falha/convertido) | Converteu? (✅ + valor do pedido 
se sim). Filtro por status. Os convertidos destacados em emerald.

ESTADOS:
- sending: foco no progresso ao vivo.
- sent (aguardando conversões): funil mostra pedidos=0 ainda, com nota 
  "Janela de atribuição aberta até DD/MM".
- completed: ROI completo.
- failed: alerta com motivo.

Dados mockados coerentes.
```

---

### 🔌 PROMPT 7 — Integrações

```txt
Crie a tela Integrações do Fidelizza usando AppLayout e design system. 
É o elo crítico: sem dados não há CRM. Inspiração: página de integrações 
do Stripe/Intercom.

PageHeader: título "Integrações", subtítulo "Conecte a fonte de dados do 
seu restaurante".

SEÇÃO "Disponíveis" — lista de provedores em LINHAS (não grid de cards):
Cada linha: logo/ícone do provedor | nome | descrição curta | status à 
direita | ação.
- Anota AI — ativo no MVP.
- Cardápio Web — ativo no MVP.
- Saipos — badge cinza "Em breve", linha desabilitada.
- iFood — badge cinza "Em breve", desabilitada.

Para um provedor JÁ CONECTADO, a linha expande mostrando:
- StatusBadge (Ativo verde / Erro vermelho / Sincronizando).
- "Último sync: há 4 min".
- Métricas inline: "1.240 clientes · 8.300 pedidos importados".
- Botão secundário "Reconfigurar" e, se erro, "Reconectar" (destaque).

FLUXO DE CONEXÃO (ao clicar "Conectar" abre um Drawer/Dialog):
- Passo a passo curto: campo de Token/Credencial (com helper "Onde 
  encontrar?"), botão "Testar conexão" (mostra loading → ✅ sucesso ou 
  ❌ erro com motivo), botão "Conectar".

CARD ÚNICO de saúde da sincronização (este card se justifica): 
"Ingestão nas últimas 24h" com mini gráfico de barras (Recharts) de 
pedidos importados por hora + total.

ESTADOS:
- não conectado (primeira vez): EmptyState no topo guiando: "Conecte sua 
  primeira fonte de dados para começar" com destaque nos provedores ativos.
- connecting/testing: spinners nos respectivos botões.
- active: verde, métricas visíveis.
- syncing: barra de progresso "Importando seus pedidos... 64%".
- error: linha em rose, "Falha na sincronização: token inválido" + 
  "Reconectar".

Dados mockados realistas.
```

---

### ⚙️ PROMPT 8 — Configurações

```txt
Crie a tela Configurações do Fidelizza usando AppLayout e design system. 
Layout com SUB-NAVEGAÇÃO LATERAL (abas verticais à esquerda do conteúdo). 
Inspiração: settings do Linear/Stripe.

Abas: Conta · WhatsApp · Usuários & Acessos · Restaurantes · Preferências.

ABA "WhatsApp" (a mais crítica — deve ser a primeira ou destacada):
- StatusBadge grande do número: "Conectado" (verde) ou "Desconectado" 
  (rose, com alerta).
- Número conectado formatado.
- Indicador de saúde: "Número saudável" / "Em aquecimento" / 
  "Desconectado".
- Se desconectado: área para reconectar com QR Code (mockup) + instruções.
- Nota explicativa: "Este é o número usado para enviar suas campanhas. Se 
  ele cair, as campanhas são pausadas automaticamente."

ABA "Conta":
- Dados da empresa (nome, CNPJ/CPF).
- Bloco de Plano/Assinatura: plano atual (ex: "Pro"), status de cobrança 
  (StatusBadge), limites (nº de números WhatsApp, nº de restaurantes), 
  uso vs limite (barra de progresso). Se "past_due": banner amber 
  não-bloqueante "Pagamento pendente".

ABA "Usuários & Acessos":
- Tabela: Nome | Email | Papel (badge: owner/admin/operator) | Status | 
  ações. Botão "Convidar usuário".
- SE a conta for do tipo agência: mostrar uma matriz/seção extra "Acesso a 
  restaurantes" — quais restaurantes cada usuário pode acessar 
  (checkboxes/tags por usuário).

ABA "Restaurantes" (visível só para conta agência ou multi-loja):
- Tabela de restaurantes da conta: Nome | Status | Nº de clientes | 
  WhatsApp conectado? | ações. Botão "Adicionar restaurante". 
  Opção arquivar.

ABA "Preferências":
- Fuso horário (default America/Sao_Paulo).
- Nome do restaurante usado na variável {restaurante} das campanhas.

PERMISSÕES: usuário com papel "operator" NÃO vê as abas Conta e 
Restaurantes (esconda-as).

ESTADOS:
- WhatsApp desconectado: além do badge, dispara o banner global de alerta 
  no topo do app (definido no shell).
- loading/saving em cada formulário.

Dados mockados realistas.
```

---

### 📐 NOTA FINAL DE HANDOFF

**Ordem de construção recomendada** (espelha o caminho do dinheiro):

```txt
1. Prompt 0  — Setup/Shell          (fundação)
2. Prompt 1  — Login                (entrada)
3. Prompt 7  — Integrações          (elo 1: dados)
4. Prompt 3  — Clientes             (elo 2: ativo)
5. Prompt 4  — Cliente              (contexto)
6. Prompt 6  — Nova Campanha        (elo 3: ação) ★
7. Prompt 6B — Campanha detalhe     (resultado)
8. Prompt 5  — Campanhas lista      (histórico)
9. Prompt 2  — Dashboard            (elo 4: prova ROI) ★
10. Prompt 8 — Configurações        (suporte)
```

**Três regras inegociáveis no handoff para o dev (eject do Lovable):**

1. **Frontend fala com a API só por contrato REST** — nada de lógica de negócio no front. As telas consomem os endpoints dos módulos MUST definidos pelo Arquiteto.
2. **O número de receita (`revenue_attributed`) vem pronto do backend** — o front nunca calcula ROI. Apenas exibe o agregado materializado da tabela `campaign`.
3. **Estado de "sending" usa polling do agregado da campanha** — sem WebSocket no MVP. Polling a cada ~5s enquanto status = sending.

---

**Pergunta de design que precisa ser respondida antes de avançar:**

> O **nome do produto** ("Fidelizza" foi usado como placeholder nos prompts) está definido? Isso impacta logo, domínio e o painel de prova de valor no Login.

> Quer que eu avance para a **Fase 6 — Design Detalhado de Componentes** (especificação visual pixel a pixel dos componentes críticos: o preview de WhatsApp, o funil de ROI e a barra RFM), ou prefere primeiro **validar estes fluxos** com o sócio comercial (Murilo) contra a Repediu?


# FASE 6 — BACKEND
### Backend Engineer Sênior

> Documento de implementação. Sai do diagrama e entra no código que vai para produção. Tudo aqui respeita as decisões já tomadas: **monólito modular NestJS**, **multi-tenant via RLS (`account_id`)**, **escopo operacional por `restaurant_id`**, **Z-API isolada atrás de adapter**, **BullMQ para tudo assíncrono**. Nenhuma decisão nova fora do MVP.

Antes de começar: **o nome do produto** segue como placeholder (`fidelizza`). Não bloqueia backend — só afeta `package.json`, namespace de logs e domínio. Mantenho `fidelizza` e marco onde trocar.

---

## PERGUNTA 19 — Estrutura inicial do projeto NestJS

### 19.1 — Decisões de fundação (antes do scaffold)

| Decisão       | Escolha                                              | Justificativa de produção                                                                                                                              |
| ------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ORM/Query** | Drizzle ORM + `node-postgres`                        | RLS exige controle fino da conexão/transação (`SET LOCAL`). Drizzle é SQL-first, leve, e não esconde a conexão como o TypeORM. Migrations versionadas. |
| **Config**    | `@nestjs/config` + Zod schema                        | Validação de env no boot. App não sobe com config inválida.                                                                                            |
| **Logs**      | `nestjs-pino`                                        | Structured logging com `requestId`, `accountId`, `restaurantId` em todo log.                                                                           |
| **Filas**     | `@nestjs/bullmq`                                     | Integração first-class. Processors como providers.                                                                                                     |
| **Validação** | `class-validator` + `class-transformer`              | DTOs com whitelist + transform.                                                                                                                        |
| **Auth**      | `@nestjs/jwt` + `passport-jwt`                       | Access token curto + refresh token.                                                                                                                    |
| **Erros**     | Global Exception Filter + Problem Details (RFC 7807) | Resposta de erro padronizada e previsível para o front.                                                                                                |
| **Workers**   | App standalone separado (`main.worker.ts`)           | API e Workers escalam independente (decisão do Arquiteto).                                                                                             |

### 19.2 — Estrutura de pastas (monorepo simples, sem Nx no MVP)

```txt
fidelizza-backend/
├── docker-compose.yml              # postgres + redis local
├── Dockerfile                      # multi-stage (api + worker no mesmo image)
├── drizzle.config.ts
├── package.json
├── tsconfig.json
├── .env.example
├── src/
│   ├── main.ts                     # bootstrap da API HTTP
│   ├── main.worker.ts              # bootstrap dos Workers (standalone)
│   ├── app.module.ts               # módulo raiz (API)
│   ├── worker.module.ts            # módulo raiz (Workers)
│   │
│   ├── config/
│   │   ├── env.schema.ts           # Zod: valida process.env
│   │   ├── config.module.ts
│   │   └── configuration.ts
│   │
│   ├── database/
│   │   ├── database.module.ts      # provider do pool pg + drizzle
│   │   ├── schema/                 # schema Drizzle (espelha o DDL da Fase 4)
│   │   │   ├── account.schema.ts
│   │   │   ├── user.schema.ts
│   │   │   ├── restaurant.schema.ts
│   │   │   ├── customer.schema.ts
│   │   │   ├── order.schema.ts
│   │   │   ├── segment.schema.ts
│   │   │   ├── campaign.schema.ts
│   │   │   ├── message-log.schema.ts
│   │   │   ├── conversion.schema.ts
│   │   │   └── index.ts
│   │   ├── migrations/             # SQL versionado (inclui CREATE POLICY RLS)
│   │   └── tenant-connection.ts    # helper: roda query com SET LOCAL app.account_id
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── tenant.decorator.ts
│   │   │   └── idempotency-key.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── restaurant-access.guard.ts   # valida user_restaurant_access
│   │   ├── interceptors/
│   │   │   ├── tenant-context.interceptor.ts  # abre TX + SET LOCAL account_id
│   │   │   └── logging.interceptor.ts
│   │   ├── filters/
│   │   │   └── all-exceptions.filter.ts       # RFC 7807
│   │   ├── pipes/
│   │   │   └── zod-validation.pipe.ts
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── problem-details.dto.ts
│   │   └── errors/
│   │       └── domain-error.ts                # erros de negócio tipados
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/jwt.strategy.ts
│   │   └── dto/{login.dto.ts, refresh.dto.ts}
│   │
│   ├── tenant/
│   │   ├── tenant.module.ts
│   │   ├── tenant-context.service.ts          # AsyncLocalStorage do contexto
│   │   └── tenant.types.ts
│   │
│   ├── restaurants/
│   │   ├── restaurants.module.ts
│   │   ├── restaurants.controller.ts
│   │   ├── restaurants.service.ts
│   │   └── dto/
│   │
│   ├── integrations/
│   │   ├── integrations.module.ts
│   │   ├── integrations.controller.ts          # CRUD + status
│   │   ├── webhooks.controller.ts              # POST /webhooks/anota-ai
│   │   ├── integrations.service.ts
│   │   ├── adapters/
│   │   │   ├── integration-adapter.interface.ts
│   │   │   ├── anota-ai.adapter.ts             # normaliza payload Anota AI
│   │   │   └── cardapio-web.adapter.ts
│   │   ├── processors/
│   │   │   └── integration-ingest.processor.ts # fila integration.ingest
│   │   └── dto/
│   │
│   ├── customers/
│   │   ├── customers.module.ts
│   │   ├── customers.controller.ts
│   │   ├── customers.service.ts
│   │   ├── customer-aggregates.service.ts      # atualiza total_orders, etc.
│   │   └── dto/
│   │
│   ├── orders/
│   │   ├── orders.module.ts
│   │   ├── orders.service.ts                   # upsert idempotente
│   │   └── dto/
│   │
│   ├── segments/
│   │   ├── segments.module.ts
│   │   ├── segments.controller.ts
│   │   ├── rfm-engine.service.ts               # cálculo por percentil
│   │   ├── processors/
│   │   │   └── segmentation.processor.ts       # fila segmentation.recalculate
│   │   └── listeners/
│   │       └── customer-updated.listener.ts
│   │
│   ├── campaigns/
│   │   ├── campaigns.module.ts
│   │   ├── campaigns.controller.ts
│   │   ├── campaigns.service.ts                # cria + snapshot de targets
│   │   ├── campaign-dispatch.service.ts        # enfileira disparo
│   │   ├── processors/
│   │   │   └── campaign-dispatch.processor.ts  # fila campaign.dispatch (rate-limited)
│   │   └── dto/
│   │
│   ├── messaging/
│   │   ├── messaging.module.ts
│   │   ├── messaging.service.ts                # fachada (não sabe que é Z-API)
│   │   ├── providers/
│   │   │   ├── whatsapp-provider.interface.ts  # o SEGURO de vida
│   │   │   └── zapi.provider.ts                # implementação Z-API
│   │   ├── webhooks.controller.ts              # POST /webhooks/zapi/status
│   │   ├── rate-limiter.service.ts             # token bucket por restaurant
│   │   └── processors/
│   │       └── message-status.processor.ts     # fila message.status
│   │
│   ├── analytics/
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts             # dashboard + ROI
│   │   ├── analytics.service.ts
│   │   ├── conversion-attribution.service.ts
│   │   ├── processors/
│   │   │   └── conversion-attribution.processor.ts
│   │   └── listeners/
│   │       └── order-created.listener.ts
│   │
│   └── queues/
│       ├── queues.module.ts                    # registra todas as filas BullMQ
│       └── queue-names.ts                      # enum central de nomes de fila
│
└── test/
    ├── e2e/
    └── unit/
```

### 19.3 — Arquivos-chave gerados

#### `docker-compose.yml` (dev local)

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: fidelizza
      POSTGRES_PASSWORD: fidelizza
      POSTGRES_DB: fidelizza
    ports: ['5432:5432']
    volumes:
      - pgdata:/var/lib/postgresql/data
    command: ['postgres', '-c', 'shared_preload_libraries=pg_stat_statements']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
    command: ['redis-server', '--maxmemory-policy', 'noeviction']
    # noeviction: filas BullMQ NUNCA podem perder jobs por OOM

volumes:
  pgdata:
```

> **Detalhe de produção:** `noeviction` no Redis é não-negociável. Com `allkeys-lru`, o Redis poderia descartar jobs da fila sob pressão de memória — você perderia disparos de campanha silenciosamente. Cache fica em namespace separado ou em outra instância.

#### `src/config/env.schema.ts` (validação no boot)

```typescript
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MAX: z.coerce.number().default(20),

  // Redis / BullMQ
  REDIS_URL: z.string().url(),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),

  // Z-API (isolado)
  ZAPI_BASE_URL: z.string().url(),
  ZAPI_CLIENT_TOKEN: z.string(),

  // Webhooks
  WEBHOOK_ANOTA_AI_SECRET: z.string().min(16),
  WEBHOOK_ZAPI_SECRET: z.string().min(16),

  // Encryption (credentials de integração no banco)
  CREDENTIALS_ENCRYPTION_KEY: z.string().length(64), // 32 bytes hex
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(
      `❌ Config inválida:\n${JSON.stringify(parsed.error.format(), null, 2)}`,
    );
  }
  return parsed.data;
}
```

#### `src/database/tenant-connection.ts` (o coração do RLS)

```typescript
import { Pool, PoolClient } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

/**
 * Executa um bloco de trabalho dentro de UMA transação com o contexto de
 * tenant setado via SET LOCAL. Isso garante que o RLS do Postgres filtre
 * por account_id automaticamente — defesa em profundidade no nível do banco.
 *
 * REGRA INVIOLÁVEL: nenhuma query operacional roda fora deste wrapper.
 */
export async function runInTenantContext<T>(
  pool: Pool,
  accountId: string,
  work: (db: ReturnType<typeof drizzle>) => Promise<T>,
): Promise<T> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    // SET LOCAL vale só nesta transação → seguro com connection pool.
    // Parametrização defensiva: set_config evita SQL injection no contexto.
    await client.query(`SELECT set_config('app.account_id', $1, true)`, [accountId]);

    const db = drizzle(client, { schema });
    const result = await work(db);

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

> **Por que `set_config(..., true)` e não `SET LOCAL app.account_id = '...'`?** `set_config` aceita parâmetro bindado (`$1`), eliminando qualquer vetor de injeção no `account_id`. O `true` no terceiro argumento = `is_local` (escopo de transação). Isso é o detalhe que separa um RLS seguro de um vazamento de dados entre clientes.

#### `src/common/interceptors/tenant-context.interceptor.ts`

```typescript
import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from '../../tenant/tenant-context.service';

/**
 * Lê o contexto de tenant (do JWT, já validado pelo guard) e o injeta no
 * AsyncLocalStorage para que services e o tenant-connection o usem sem
 * precisar passar accountId manualmente por toda a stack.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user; // populado pelo JwtAuthGuard

    return this.tenantContext.run(
      {
        accountId: user.accountId,
        userId: user.sub,
        role: user.role,
        allowedRestaurantIds: user.allowedRestaurantIds, // resolvido no login
        requestId: req.id,
      },
      () => next.handle(),
    );
  }
}
```

#### `src/common/filters/all-exceptions.filter.ts` (RFC 7807)

```typescript
import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../errors/domain-error';
import { PinoLogger } from 'nestjs-pino';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let type = 'about:blank';
    let title = 'Internal Server Error';
    let detail = 'Ocorreu um erro inesperado.';
    let errors: unknown;

    if (exception instanceof DomainError) {
      status = exception.httpStatus;
      type = `https://fidelizza.com/errors/${exception.code}`;
      title = exception.title;
      detail = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      title = HttpStatus[status] ?? 'Error';
      if (typeof body === 'object' && body !== null) {
        detail = (body as any).message ?? detail;
        errors = (body as any).message; // validation errors array
      } else {
        detail = String(body);
      }
    }

    // Log estruturado — 5xx em erro, 4xx em warn
    const logPayload = {
      requestId: req.id,
      path: req.url,
      method: req.method,
      status,
      err: exception instanceof Error ? exception.stack : exception,
    };
    if (status >= 500) this.logger.error(logPayload, 'Unhandled exception');
    else this.logger.warn(logPayload, 'Handled exception');

    // RFC 7807 Problem Details
    res.status(status).json({
      type,
      title,
      status,
      detail,
      instance: req.url,
      requestId: req.id,
      ...(errors ? { errors } : {}),
    });
  }
}
```

#### `src/common/errors/domain-error.ts`

```typescript
import { HttpStatus } from '@nestjs/common';

/** Erros de negócio tipados — mapeiam direto para Problem Details. */
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    public readonly title: string,
    message: string,
    public readonly httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

// Catálogo de erros do domínio (usado por todos os módulos)
export const Errors = {
  WhatsAppNotConnected: () =>
    new DomainError(
      'whatsapp_not_connected',
      'WhatsApp não conectado',
      'O número de WhatsApp não está conectado. Conecte antes de disparar.',
      HttpStatus.CONFLICT,
    ),
  SegmentEmpty: () =>
    new DomainError(
      'segment_empty',
      'Segmento vazio',
      'Não há clientes com opt-in neste segmento para enviar a campanha.',
      HttpStatus.UNPROCESSABLE_ENTITY,
    ),
  RestaurantAccessDenied: () =>
    new DomainError(
      'restaurant_access_denied',
      'Acesso negado',
      'Você não tem acesso a este restaurante.',
      HttpStatus.FORBIDDEN,
    ),
  CampaignNotDraft: () =>
    new DomainError(
      'campaign_not_draft',
      'Campanha não editável',
      'A campanha já foi disparada e não pode ser alterada.',
      HttpStatus.CONFLICT,
    ),
};
```

#### `src/main.ts` (bootstrap da API)

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableCors({ origin: process.env.FRONTEND_ORIGIN?.split(',') ?? true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // remove props não declaradas no DTO
      forbidNonWhitelisted: true, // 400 se vier prop desconhecida
      transform: true,            // converte tipos (query string → number)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(app.get(AllExceptionsFilter));

  // OpenAPI (Pergunta 21) — só em não-produção ou atrás de auth
  if (process.env.NODE_ENV !== 'production') {
    const { setupSwagger } = await import('./swagger');
    setupSwagger(app);
  }

  app.enableShutdownHooks(); // graceful shutdown (drena conexões/jobs)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

#### `src/main.worker.ts` (bootstrap dos Workers — processo separado)

```typescript
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { WorkerModule } from './worker.module';

/**
 * Processo standalone: SEM servidor HTTP. Só consome filas BullMQ.
 * Escala independente da API. Falha de disparo Z-API não derruba o painel.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks(); // espera jobs em andamento antes de morrer
  // os processors se auto-registram via @Processor — só manter vivo:
  await new Promise(() => {}); // keep alive
}
bootstrap();
```

---

## PERGUNTA 20 — APIs do MVP

Organizei por módulo, no caminho do dinheiro. Cada grupo segue o template de design (objetivo, serviços, eventos, jobs, falhas, gargalos).

### 20.1 — Visão consolidada (tabela de endpoints)

| Método | Rota | Descrição | Auth | Escopo |
|---|---|---|---|---|
| **AUTH** |
| `POST` | `/v1/auth/login` | Login, retorna access+refresh | Pública | — |
| `POST` | `/v1/auth/refresh` | Renova access token | Refresh token | — |
| `POST` | `/v1/auth/logout` | Revoga refresh token | JWT | — |
| `GET`  | `/v1/auth/me` | Dados do usuário + restaurantes acessíveis | JWT | — |
| **RESTAURANTS** |
| `GET`  | `/v1/restaurants` | Lista restaurantes acessíveis | JWT | account |
| `GET`  | `/v1/restaurants/:id` | Detalhe | JWT | restaurant |
| `PATCH`| `/v1/restaurants/:id` | Atualiza settings/timezone | JWT (admin) | restaurant |
| **INTEGRATIONS** |
| `GET`  | `/v1/restaurants/:rid/integrations` | Lista integrações + status | JWT | restaurant |
| `POST` | `/v1/restaurants/:rid/integrations` | Conecta provider | JWT (admin) | restaurant |
| `POST` | `/v1/restaurants/:rid/integrations/:id/test` | Testa credencial | JWT (admin) | restaurant |
| `DELETE`| `/v1/restaurants/:rid/integrations/:id` | Desconecta | JWT (admin) | restaurant |
| `POST` | `/webhooks/anota-ai` | **Webhook de ingestão (público+HMAC)** | HMAC | — |
| **CUSTOMERS** |
| `GET`  | `/v1/restaurants/:rid/customers` | Lista (filtro segmento, busca, paginação) | JWT | restaurant |
| `GET`  | `/v1/restaurants/:rid/customers/:id` | Perfil + agregados | JWT | restaurant |
| `GET`  | `/v1/restaurants/:rid/customers/:id/timeline` | Timeline unificada | JWT | restaurant |
| `PATCH`| `/v1/restaurants/:rid/customers/:id` | Edita nome/email/consent | JWT | restaurant |
| **SEGMENTS** |
| `GET`  | `/v1/restaurants/:rid/segments` | Lista 4 segmentos + contagens | JWT | restaurant |
| `POST` | `/v1/restaurants/:rid/segments/recalculate` | Força recálculo RFM | JWT (admin) | restaurant |
| **CAMPAIGNS** |
| `GET`  | `/v1/restaurants/:rid/campaigns` | Lista + performance | JWT | restaurant |
| `POST` | `/v1/restaurants/:rid/campaigns` | Cria rascunho | JWT | restaurant |
| `GET`  | `/v1/restaurants/:rid/campaigns/:id` | Detalhe + funil ROI | JWT | restaurant |
| `PATCH`| `/v1/restaurants/:rid/campaigns/:id` | Edita (só draft) | JWT | restaurant |
| `POST` | `/v1/restaurants/:rid/campaigns/:id/preview` | Calcula alcance/excluídos | JWT | restaurant |
| `POST` | `/v1/restaurants/:rid/campaigns/:id/dispatch` | **Dispara (idempotente)** | JWT | restaurant |
| `GET`  | `/v1/restaurants/:rid/campaigns/:id/targets` | Lista destinatários + status | JWT | restaurant |
| **MESSAGING** |
| `POST` | `/webhooks/zapi/status` | **Webhook de status Z-API (público+HMAC)** | HMAC | — |
| **ANALYTICS** |
| `GET`  | `/v1/restaurants/:rid/analytics/dashboard` | KPIs + receita atribuída | JWT | restaurant |
| `GET`  | `/v1/restaurants/:rid/analytics/rfm-distribution` | Distribuição da base | JWT | restaurant |
| **SETTINGS / WHATSAPP** |
| `GET`  | `/v1/restaurants/:rid/whatsapp/status` | Saúde do número | JWT | restaurant |
| `POST` | `/v1/restaurants/:rid/whatsapp/connect` | Inicia conexão (QR) | JWT (admin) | restaurant |
| **HEALTH** |
| `GET`  | `/health` | Liveness | Pública | — |
| `GET`  | `/health/ready` | Readiness (pg+redis) | Pública | — |

### 20.2 — Detalhamento do endpoint mais crítico: `dispatch`

Este é **o caminho do dinheiro**. Detalho no template completo:

```txt
1. OBJETIVO
   Disparar uma campanha: congelar o público (snapshot), enfileirar o envio
   gradual (anti-ban) e mover a campanha para "sending". Síncrono retorna
   rápido; o envio real é assíncrono nos workers.

2. SERVIÇOS ENVOLVIDOS
   - CampaignsService           (valida estado, gera targets)
   - WhatsApp status check      (número conectado?)
   - CampaignDispatchService    (enfileira jobs em campaign.dispatch)
   - RateLimiterService         (token bucket por restaurant)

3. APIS NECESSÁRIAS
   POST /v1/restaurants/:rid/campaigns/:id/dispatch
   Header obrigatório: Idempotency-Key (UUID do cliente)

4. EVENTOS NECESSÁRIOS
   - campaign.dispatching.started (interno, métrica)
   Não emite domain events aqui; o envio gera message.status depois.

5. JOBS NECESSÁRIOS
   - Fila: campaign.dispatch
   - 1 job por target (ou batch de N) com delay escalonado (jitter)
   - Cada job: render template → zapi.send → cria message_log → respeita
     rate limit do restaurante

6. TRATAMENTO DE FALHAS
   - WhatsApp desconectado → 409 Errors.WhatsAppNotConnected (não enfileira)
   - Segmento vazio (após opt-out) → 422 Errors.SegmentEmpty
   - Idempotency-Key repetida → retorna a mesma campanha (não re-dispara)
   - Campanha não-draft → 409 Errors.CampaignNotDraft
   - Falha de job individual Z-API → retry exponencial (3x) → se esgotar,
     message_log.status='failed', campaign_target.status='failed'
   - Disparo nunca duplica: uq_target_once (campaign_id, customer_id)

7. POSSÍVEIS GARGALOS
   - Geração de targets para segmento grande (10k+ clientes):
     fazer em INSERT ... SELECT no banco, NÃO em loop na app.
   - Rate limit Z-API por número: throughput limitado de propósito.
     Disparo de 10k = ~horas. Comunicar estimativa ao usuário (já no UX).
   - Concorrência de filas entre restaurantes: usar BullMQ com
     concurrency por grupo (group key = restaurant_id) p/ isolar números.
```

#### Implementação do `dispatch` (controller + service)

```typescript
// campaigns.controller.ts
@Post(':id/dispatch')
@HttpCode(HttpStatus.ACCEPTED)
async dispatch(
  @Param('rid') restaurantId: string,
  @Param('id') campaignId: string,
  @Headers('idempotency-key') idempotencyKey: string,
  @Body() dto: DispatchCampaignDto,
): Promise<CampaignDispatchResponseDto> {
  if (!idempotencyKey) {
    throw new DomainError(
      'missing_idempotency_key',
      'Idempotency-Key obrigatória',
      'Envie o header Idempotency-Key para evitar disparo duplicado.',
      HttpStatus.BAD_REQUEST,
    );
  }
  return this.campaignsService.dispatch(restaurantId, campaignId, {
    idempotencyKey,
    sendMode: dto.sendMode,      // 'now' | 'scheduled'
    scheduledAt: dto.scheduledAt,
  });
}
```

```typescript
// campaigns.service.ts (trecho do dispatch)
async dispatch(
  restaurantId: string,
  campaignId: string,
  opts: DispatchOptions,
): Promise<CampaignDispatchResponseDto> {
  const accountId = this.tenantContext.get().accountId;

  // Idempotência: chave já processada? (Redis SETNX com TTL 24h)
  const idemKey = `idem:dispatch:${campaignId}:${opts.idempotencyKey}`;
  const firstTime = await this.redis.set(idemKey, '1', 'EX', 86400, 'NX');
  if (!firstTime) {
    // Retorna estado atual sem re-disparar
    return this.getDispatchState(restaurantId, campaignId);
  }

  return runInTenantContext(this.pool, accountId, async (db) => {
    // 1. Carrega campanha com lock (FOR UPDATE) — evita corrida
    const campaign = await this.loadCampaignForUpdate(db, campaignId);
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw Errors.CampaignNotDraft();
    }

    // 2. Pré-condição: WhatsApp conectado
    const wpp = await this.whatsappStatus.check(restaurantId);
    if (!wpp.connected) throw Errors.WhatsAppNotConnected();

    // 3. Snapshot dos targets — INSERT ... SELECT (NUNCA loop na app)
    //    Só clientes do segmento com consent_whatsapp = true
    const targetsCount = await db.execute(sql`
      INSERT INTO campaign_target
        (id, account_id, restaurant_id, campaign_id, customer_id,
         phone_snapshot, name_snapshot, segment_snapshot, status)
      SELECT
        uuid_generate_v7(), c.account_id, c.restaurant_id, ${campaignId},
        c.id, c.phone, c.name, c.current_segment_key, 'pending'
      FROM customer c
      WHERE c.restaurant_id = ${restaurantId}
        AND c.current_segment_key = ${campaign.segmentKey}
        AND c.consent_whatsapp = true
        AND c.deleted_at IS NULL
      ON CONFLICT (campaign_id, customer_id) DO NOTHING
      RETURNING 1;
    `);

    const count = targetsCount.rowCount ?? 0;
    if (count === 0) throw Errors.SegmentEmpty();

    // 4. Atualiza estado da campanha
    await db.update(campaignTable)
      .set({ status: 'sending', targetsCount: count, sentAt: new Date() })
      .where(eq(campaignTable.id, campaignId));

    // 5. Enfileira o disparo (fora da TX seria ideal; aqui after-commit hook)
    await this.dispatchService.enqueue({
      accountId, restaurantId, campaignId, targetsCount: count,
      sendMode: opts.sendMode, scheduledAt: opts.scheduledAt,
    });

    return {
      campaignId,
      status: 'sending',
      targetsCount: count,
      estimatedDurationSeconds: this.estimateDuration(count),
    };
  });
}
```

> **Detalhe crítico de idempotência:** o `Idempotency-Key` evita que um duplo-clique ou retry de rede dispare a campanha duas vezes (= cliente recebe 2 mensagens = banimento + reclamação). Combinado com `uq_target_once` no banco, é defesa em duas camadas.

---

## PERGUNTA 21 — Especificação OpenAPI

### 21.1 — Estratégia: **code-first com `@nestjs/swagger`**

Decisão de produção: gerar OpenAPI a partir dos DTOs decorados (`@ApiProperty`) em vez de manter um YAML manual. O contrato nunca diverge do código. O front consome o `openapi.json` para gerar tipos (ex.: `openapi-typescript`).

#### `src/swagger.ts`

```typescript
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Fidelizza API')
    .setDescription('CRM de reativação via WhatsApp para restaurantes delivery')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addServer('http://localhost:3000', 'Local')
    .addServer('https://api.fidelizza.com', 'Produção')
    .addTag('Auth')
    .addTag('Restaurants')
    .addTag('Integrations')
    .addTag('Customers')
    .addTag('Segments')
    .addTag('Campaigns')
    .addTag('Analytics')
    .addTag('Webhooks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // Exporta para o front gerar tipos
  writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
}
```

#### Exemplo de DTOs decorados (geram o schema)

```typescript
// auth/dto/login.dto.ts
export class LoginDto {
  @ApiProperty({ example: 'operador@pizzaria.com', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha-forte', minLength: 8 })
  @IsString() @MinLength(8)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty() accessToken: string;
  @ApiProperty() refreshToken: string;
  @ApiProperty({ example: 900, description: 'TTL do access em segundos' })
  expiresIn: number;
  @ApiProperty({ type: () => MeDto }) user: MeDto;
}

// campaigns/dto/create-campaign.dto.ts
export class CreateCampaignDto {
  @ApiProperty({ example: 'Reativação Inativos Outubro' })
  @IsString() @MaxLength(120)
  name: string;

  @ApiProperty({ enum: ['champions', 'new', 'at_risk', 'inactive'] })
  @IsIn(['champions', 'new', 'at_risk', 'inactive'])
  segmentKey: string;

  @ApiProperty({
    example: 'Oi {nome}! Sentimos sua falta na {restaurante} 🍕 Volte e ganhe 15%!',
  })
  @IsString() @MaxLength(1000)
  messageTemplate: string;

  @ApiProperty({ example: 7, minimum: 1, maximum: 30, default: 7 })
  @IsInt() @Min(1) @Max(30) @IsOptional()
  attributionWindowDays?: number = 7;
}
```

### 21.2 — Recorte do `openapi.json` gerado (essencial)

```yaml
openapi: 3.0.0
info:
  title: Fidelizza API
  version: 1.0.0
  description: CRM de reativação via WhatsApp para restaurantes delivery
servers:
  - url: https://api.fidelizza.com
    description: Produção
security:
  - access-token: []
paths:
  /v1/auth/login:
    post:
      tags: [Auth]
      summary: Autentica operador e resolve restaurantes acessíveis
      security: []   # pública
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/LoginDto' }
      responses:
        '200':
          description: Autenticado
          content:
            application/json:
              schema: { $ref: '#/components/schemas/LoginResponseDto' }
        '401':
          description: Credenciais inválidas
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ProblemDetails' }

  /v1/restaurants/{rid}/campaigns/{id}/dispatch:
    post:
      tags: [Campaigns]
      summary: Dispara campanha (idempotente, assíncrono)
      parameters:
        - { name: rid, in: path, required: true, schema: { type: string, format: uuid } }
        - { name: id,  in: path, required: true, schema: { type: string, format: uuid } }
        - name: Idempotency-Key
          in: header
          required: true
          schema: { type: string, format: uuid }
          description: Evita disparo duplicado em retries.
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/DispatchCampaignDto' }
      responses:
        '202':
          description: Disparo aceito e enfileirado
          content:
            application/json:
              schema: { $ref: '#/components/schemas/CampaignDispatchResponseDto' }
        '409':
          description: WhatsApp desconectado ou campanha já disparada
        '422':
          description: Segmento vazio (sem opt-in)

  /webhooks/anota-ai:
    post:
      tags: [Webhooks]
      summary: Recebe eventos de pedido da Anota AI (HMAC assinado)
      security: []
      parameters:
        - name: X-Anota-Signature
          in: header
          required: true
          schema: { type: string }
          description: HMAC-SHA256 do corpo bruto com o secret compartilhado.
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/AnotaAiWebhookDto' }
      responses:
        '200': { description: Aceito e enfileirado (sempre 200 rápido) }
        '401': { description: Assinatura inválida }

components:
  securitySchemes:
    access-token:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    ProblemDetails:
      type: object
      description: RFC 7807
      properties:
        type:      { type: string, example: 'https://fidelizza.com/errors/segment_empty' }
        title:     { type: string, example: 'Segmento vazio' }
        status:    { type: integer, example: 422 }
        detail:    { type: string }
        instance:  { type: string }
        requestId: { type: string }
    CampaignDispatchResponseDto:
      type: object
      properties:
        campaignId:                { type: string, format: uuid }
        status:                    { type: string, example: sending }
        targetsCount:              { type: integer, example: 342 }
        estimatedDurationSeconds:  { type: integer, example: 2700 }
    # ... demais schemas gerados automaticamente dos DTOs
```

> **Fluxo de uso no front:** `npm run openapi:types` roda `openapi-typescript ./openapi.json -o ./src/api/types.ts`. O front passa a ter tipagem 100% sincronizada com o backend, sem duplicação manual. Cumpre a regra do UX: *"front fala com a API só por contrato REST"*.

---

## PERGUNTA 22 — Webhooks da Anota AI

> Este é o **elo 1 do dinheiro**. Sem ingestão confiável, não há CRM. Trato como sistema crítico: precisa ser idempotente, resiliente, rápido e auditável.

### 22.1 — Princípio arquitetural: **receber rápido, processar depois**

```txt
Anota AI → POST /webhooks/anota-ai
              ↓ (síncrono, < 50ms)
         1. Valida HMAC
         2. Persiste evento bruto (webhook_event) — auditoria + replay
         3. Enfileira em integration.ingest
         4. Responde 200 IMEDIATAMENTE
              ↓ (assíncrono, worker)
         5. Normaliza via AnotaAiAdapter
         6. Upsert customer + order (idempotente)
         7. Atualiza agregados
         8. Emite order.created → conversion.attribution
         9. Emite customer.updated → segmentation.recalculate
```

> **Por que nunca processar no request do webhook?** A Anota AI tem timeout. Se processarmos síncrono (normalizar, upsert, recalcular RFM), um pico de pedidos no horário de almoço estoura o timeout → a Anota AI marca como falha → reenvia → duplica carga. Recebendo rápido e processando na fila, absorvemos qualquer pico com backpressure controlado.

### 22.2 — Tabela de eventos brutos (auditoria + replay)

```sql
-- Migration adicional: armazena todo webhook recebido (antes de processar)
CREATE TABLE webhook_event (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    provider        TEXT NOT NULL,              -- 'anota_ai'
    event_type      TEXT,                       -- 'order.created', etc.
    external_id     TEXT,                       -- id do pedido na origem
    signature_valid BOOLEAN NOT NULL,
    payload         JSONB NOT NULL,             -- corpo bruto
    status          TEXT NOT NULL DEFAULT 'received'
                        CHECK (status IN ('received','processed','failed','skipped')),
    error           TEXT,
    received_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at    TIMESTAMPTZ
);
-- Dedupe natural: mesmo evento da origem não entra 2x
CREATE UNIQUE INDEX uq_webhook_dedupe
    ON webhook_event (provider, external_id, event_type)
    WHERE external_id IS NOT NULL;
```

> **Valor do `webhook_event`:** se um bug no adapter corromper dados, dá pra **reprocessar** tudo a partir do payload bruto. É a caixa-preta da ingestão. Custa quase nada e salva o produto num incidente.

### 22.3 — Controller do webhook (recebe rápido)

```typescript
// integrations/webhooks.controller.ts
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhookService: AnotaAiWebhookService,
    private readonly logger: PinoLogger,
  ) {}

  @Post('anota-ai')
  @HttpCode(HttpStatus.OK)
  @SkipAuth() // rota pública — segurança via HMAC
  async handleAnotaAi(
    @Headers('x-anota-signature') signature: string,
    @RawBody() rawBody: Buffer,        // corpo BRUTO p/ validar HMAC
    @Body() payload: AnotaAiWebhookDto,
  ): Promise<{ received: true }> {
    // 1. Valida assinatura HMAC com o corpo bruto (não o parseado!)
    const valid = this.webhookService.verifySignature(rawBody, signature);
    if (!valid) {
      this.logger.warn({ signature }, 'Webhook Anota AI: assinatura inválida');
      throw new UnauthorizedException('Invalid signature');
    }

    // 2. Persiste bruto + enfileira (idempotente). NÃO processa aqui.
    await this.webhookService.receiveAndEnqueue(payload, rawBody);

    // 3. Responde imediatamente. Sempre 200 se aceito.
    return { received: true };
  }
}
```

> **Pegadinha de produção:** o HMAC deve ser calculado sobre o **corpo bruto** (bytes recebidos), não sobre o objeto reparseado/reserializado — `JSON.stringify` reordena chaves e muda o hash. Por isso uso `@RawBody()` (requer `rawBody: true` no `NestFactory.create`).

### 22.4 — Service: validação HMAC + enfileiramento

```typescript
// integrations/anota-ai-webhook.service.ts
@Injectable()
export class AnotaAiWebhookService {
  constructor(
    @Inject('PG_POOL') private readonly pool: Pool,
    @InjectQueue(QueueNames.INTEGRATION_INGEST)
    private readonly ingestQueue: Queue,
    private readonly config: ConfigService<Env>,
  ) {}

  verifySignature(rawBody: Buffer, signature: string): boolean {
    const secret = this.config.get('WEBHOOK_ANOTA_AI_SECRET', { infer: true });
    const expected = createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    // Comparação time-safe contra timing attack
    return signature?.length === expected.length &&
      timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  async receiveAndEnqueue(
    payload: AnotaAiWebhookDto,
    rawBody: Buffer,
  ): Promise<void> {
    const externalId = payload.order?.id ?? null;
    const eventType = payload.event ?? 'unknown';

    // Persiste bruto com dedupe (ON CONFLICT DO NOTHING)
    const inserted = await this.pool.query(
      `INSERT INTO webhook_event
         (provider, event_type, external_id, signature_valid, payload, status)
       VALUES ('anota_ai', $1, $2, true, $3, 'received')
       ON CONFLICT (provider, external_id, event_type)
         WHERE external_id IS NOT NULL
         DO NOTHING
       RETURNING id`,
      [eventType, externalId, JSON.stringify(payload)],
    );

    // Já recebido antes? não re-enfileira (idempotência na borda)
    if (inserted.rowCount === 0) return;

    const webhookEventId = inserted.rows[0].id;

    // Enfileira com jobId determinístico = 2ª camada de dedupe no BullMQ
    await this.ingestQueue.add(
      'ingest',
      { webhookEventId, provider: 'anota_ai' },
      {
        jobId: `anota:${eventType}:${externalId}`, // dedupe BullMQ
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    );
  }
}
```

### 22.5 — Adapter: normaliza o payload (o ponto de extensão)

```typescript
// integrations/adapters/integration-adapter.interface.ts
export interface NormalizedOrder {
  externalId: string;
  customer: {
    phone: string;          // já em E.164
    name?: string;
    email?: string;
    birthDate?: string;
  };
  totalAmount: number;
  discountAmount: number;
  channel?: string;
  orderedAt: Date;
  items: NormalizedOrderItem[];
}

export interface IntegrationAdapter {
  readonly provider: string;
  /** Converte payload cru do provider para o modelo de domínio. */
  normalize(payload: unknown): NormalizedOrder | null; // null = ignorar evento
}
```

```typescript
// integrations/adapters/anota-ai.adapter.ts
@Injectable()
export class AnotaAiAdapter implements IntegrationAdapter {
  readonly provider = 'anota_ai';

  normalize(payload: AnotaAiWebhookDto): NormalizedOrder | null {
    // Só processamos pedidos concluídos (regra de negócio do RFM)
    if (payload.event !== 'order.completed') return null;

    const o = payload.order;
    if (!o?.customer?.phone) return null; // sem telefone = inútil p/ CRM

    return {
      externalId: String(o.id),
      customer: {
        phone: this.toE164(o.customer.phone),   // normalização CRÍTICA
        name: o.customer.name?.trim(),
        email: o.customer.email?.toLowerCase(),
        birthDate: o.customer.birthDate,
      },
      totalAmount: Number(o.total),
      discountAmount: Number(o.discount ?? 0),
      channel: o.channel ?? 'anota_ai',
      orderedAt: new Date(o.createdAt),
      items: (o.items ?? []).map((i) => ({
        productName: i.name,
        productExternalId: i.id ? String(i.id) : undefined,
        quantity: Number(i.quantity),
        unitPrice: Number(i.price),
        totalPrice: Number(i.price) * Number(i.quantity),
      })),
    };
  }

  /** Normaliza telefone BR para E.164. É a chave de unificação do cliente. */
  private toE164(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    // já com 55? mantém. senão, assume BR.
    const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
    return `+${withCountry}`;
  }
}
```

> **A normalização de telefone é o ponto mais sensível da ingestão.** Se `(11) 99999-9999`, `11999999999` e `+5511999999999` virarem clientes diferentes, a unificação quebra e o RFM mente. O `toE164` é simples no MVP; em produção, considerar `libphonenumber-js` para tratar DDDs, 9º dígito e edge cases. Marco como dívida técnica conhecida e barata de pagar.

### 22.6 — Processor: ingestão idempotente (worker)

```typescript
// integrations/processors/integration-ingest.processor.ts
@Processor(QueueNames.INTEGRATION_INGEST, { concurrency: 10 })
export class IntegrationIngestProcessor extends WorkerHost {
  constructor(
    @Inject('PG_POOL') private readonly pool: Pool,
    private readonly adapters: AdapterRegistry,
    private readonly customers: CustomersService,
    private readonly orders: OrdersService,
    private readonly events: EventEmitter2,
    private readonly logger: PinoLogger,
  ) { super(); }

  async process(job: Job<{ webhookEventId: string; provider: string }>) {
    const { webhookEventId, provider } = job.data;

    // 1. Carrega o evento bruto
    const evt = await this.loadWebhookEvent(webhookEventId);
    if (evt.status === 'processed') return; // 3ª camada de idempotência

    // 2. Normaliza
    const adapter = this.adapters.get(provider);
    const normalized = adapter.normalize(evt.payload);
    if (!normalized) {
      await this.markEvent(webhookEventId, 'skipped');
      return;
    }

    // 3. Resolve account/restaurant do evento (via integration credentials)
    const { accountId, restaurantId, integrationId } =
      await this.resolveTenant(evt.payload, provider);

    // 4. Processa DENTRO do contexto de tenant (RLS ativo)
    await runInTenantContext(this.pool, accountId, async (db) => {
      // 4a. Upsert customer por telefone (chave de unificação)
      const customer = await this.customers.upsertByPhone(db, {
        accountId, restaurantId,
        phone: normalized.customer.phone,
        name: normalized.customer.name,
        email: normalized.customer.email,
        birthDate: normalized.customer.birthDate,
      });

      // 4b. Insere order idempotente (uq_order_external)
      const orderResult = await this.orders.insertIdempotent(db, {
        accountId, restaurantId, integrationId,
        customerId: customer.id,
        externalId: normalized.externalId,
        totalAmount: normalized.totalAmount,
        discountAmount: normalized.discountAmount,
        channel: normalized.channel,
        orderedAt: normalized.orderedAt,
        items: normalized.items,
      });

      // Pedido duplicado? para aqui (idempotência total)
      if (orderResult.alreadyExisted) {
        await this.markEvent(webhookEventId, 'processed');
        return;
      }

      // 4c. Atualiza agregados do customer (total_orders, last_order_at...)
      await this.customers.refreshAggregates(db, customer.id);

      await this.markEvent(webhookEventId, 'processed');

      // 5. Emite eventos APÓS commit (registra para o after-commit hook)
      this.scheduleEvents(() => {
        this.events.emit('order.created', {
          accountId, restaurantId,
          customerId: customer.id,
          orderId: orderResult.orderId,
          orderedAt: normalized.orderedAt,
          totalAmount: normalized.totalAmount,
        });
        this.events.emit('customer.updated', {
          accountId, restaurantId, customerId: customer.id,
        });
      });
    });
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      { jobId: job.id, attempts: job.attemptsMade, err: err.stack },
      'Falha na ingestão Anota AI',
    );
    // Após esgotar attempts, BullMQ move p/ failed; alerta via monitoramento.
  }
}
```

#### `orders.service.ts` — upsert idempotente (a base da confiabilidade)

```typescript
async insertIdempotent(
  db: DrizzleDB,
  data: InsertOrderData,
): Promise<{ orderId: string; alreadyExisted: boolean }> {
  // uq_order_external (restaurant_id, integration_id, external_id, ordered_at)
  const result = await db.execute(sql`
    INSERT INTO "order"
      (id, account_id, restaurant_id, customer_id, integration_id,
       external_id, total_amount, discount_amount, channel, status, ordered_at)
    VALUES
      (uuid_generate_v7(), ${data.accountId}, ${data.restaurantId},
       ${data.customerId}, ${data.integrationId}, ${data.externalId},
       ${data.totalAmount}, ${data.discountAmount}, ${data.channel},
       'completed', ${data.orderedAt})
    ON CONFLICT (restaurant_id, integration_id, external_id, ordered_at)
      DO NOTHING
    RETURNING id;
  `);

  if (result.rowCount === 0) {
    return { orderId: '', alreadyExisted: true };
  }

  const orderId = result.rows[0].id;
  // Insere itens (mesma TX)
  if (data.items.length) {
    await this.insertItems(db, orderId, data);
  }
  return { orderId, alreadyExisted: false };
}
```

### 22.7 — Template completo do sistema de webhooks

```txt
1. OBJETIVO
   Ingerir pedidos da Anota AI de forma confiável, idempotente e resiliente,
   alimentando a base de clientes e disparando segmentação/atribuição.

2. SERVIÇOS ENVOLVIDOS
   - WebhooksController         (recebe + valida HMAC)
   - AnotaAiWebhookService      (persiste bruto + enfileira)
   - IntegrationIngestProcessor (worker: normaliza + persiste)
   - AnotaAiAdapter             (normalização)
   - CustomersService / OrdersService (upsert idempotente)

3. APIS NECESSÁRIAS
   POST /webhooks/anota-ai  (pública, HMAC via X-Anota-Signature)

4. EVENTOS NECESSÁRIOS
   - order.created    → dispara conversion.attribution
   - customer.updated → dispara segmentation.recalculate

5. JOBS NECESSÁRIOS
   - Fila integration.ingest (attempts:5, backoff exponencial)
   - jobId determinístico = dedupe na fila

6. TRATAMENTO DE FALHAS
   - HMAC inválido → 401, evento descartado (logado)
   - Evento duplicado → dedupe em 3 camadas:
       (a) uq_webhook_dedupe no banco
       (b) jobId determinístico no BullMQ
       (c) uq_order_external no upsert
   - Falha de processamento → retry exponencial 5x → failed + alerta
   - Payload sem telefone → skipped (não é erro)
   - Bug no adapter → reprocessável a partir de webhook_event.payload

7. POSSÍVEIS GARGALOS
   - Pico de almoço/jantar (muitos pedidos simultâneos):
       absorvido pela fila; concurrency:10 ajustável.
   - resolveTenant por integration: cachear credentials→tenant no Redis
       (TTL curto) p/ evitar query por evento.
   - refreshAggregates por pedido: em alto volume, considerar
       agregação incremental (UPDATE +1) em vez de recálculo total.
   - Particionamento de "order" por mês já mitiga índice gigante.
```

---

### RESUMO DA FASE 6 (o que foi entregue)

| Item | Entrega |
|---|---|
| **Estrutura NestJS** | Monólito modular, API + Workers separados, RLS via `runInTenantContext`, config validada por Zod, erros RFC 7807 |
| **APIs do MVP** | 30+ endpoints mapeados no caminho do dinheiro; `dispatch` detalhado com idempotência dupla |
| **OpenAPI** | Code-first com `@nestjs/swagger`, export de `openapi.json` para tipagem do front |
| **Webhooks Anota AI** | Receber-rápido-processar-depois, HMAC time-safe, idempotência em 3 camadas, replay via `webhook_event`, adapter isolado |

#### Três decisões inegociáveis reforçadas

1. **RLS é a fronteira de segurança** — toda query operacional passa por `runInTenantContext`. Sem exceção. Vazar dado entre restaurantes mata o produto juridicamente.
2. **Idempotência em toda borda** — webhook, dispatch e order têm dedupe múltiplo. Em SaaS de mensageria, processar duas vezes = banimento + reclamação.
3. **Z-API fica atrás de `WhatsAppProvider`** — nenhum módulo fora de `messaging` sabe que Z-API existe. É o seguro contra o risco existencial de banimento.

---

**Perguntas que preciso destravar antes de avançar para a Fase 7 (Workers de campanha e Z-API):**

> 1. **Confirma o nome do produto** (`Fidelizza` placeholder)? Impacta namespace, `package.json` e domínio dos webhooks.
> 2. **A Anota AI entrega webhook push ou exige polling?** Modelei push com HMAC. Se for polling, troco o controller por um job agendado mantendo o mesmo adapter/processor.
> 3. **O `resolveTenant` no webhook**: a Anota AI envia algum identificador do restaurante no payload, ou cada restaurante terá uma URL de webhook única (ex.: `/webhooks/anota-ai/:integrationToken`)? Isso muda como descobrimos qual tenant é dono do pedido.

Quer que eu avance para a **Fase 7 — Workers de Campanha + Adapter Z-API** (o módulo mais arriscado: rate limiting anti-ban, warm-up, token bucket por número, processor de disparo e webhook de status), ou prefere primeiro revisar os contratos de API com o front?

# FASE 7 — DOCUMENTAÇÃO FINAL
## Software Architect / CTO

> Documento de encerramento da fase de descoberta e design. Consolida **todas** as decisões das Fases 1 a 6 em um único artefato de referência (SAD — *Software Architecture Document*) e formaliza cada decisão crítica como ADR (*Architecture Decision Record*). A partir daqui, não se inventa mais o sistema — implementa-se o que já foi pensado.

---

## PERGUNTA 23 — Documento de Arquitetura Consolidado

---

### 📄 DOCUMENTO 05 — ARQUITETURA (SAD)

#### Metadados

| Campo                   | Valor                                                  |
| ----------------------- | ------------------------------------------------------ |
| **Produto**             | `Fidelizza` (nome placeholder — pendente de validação) |
| **Tipo**                | SaaS B2B multi-tenant                                  |
| **Domínio**             | CRM + Food Marketing para restaurantes delivery        |
| **Versão do documento** | 1.0 (consolidado pós-Fase 6)                           |
| **Status**              | Aprovado para implementação                            |
| **Autores**             | Arquiteto/CTO, com insumos de PO, DBA, UX e Backend    |

---

#### 1. VISÃO EXECUTIVA

O `Fidelizza` é uma plataforma SaaS que transforma a base de clientes de um restaurante delivery em **faturamento recorrente via WhatsApp**. O produto compete inicialmente com a Repediu, buscando paridade funcional no MVP e diferenciação via IA nas fases posteriores.

**Proposta de valor:** *"Envie a campanha certa para o cliente certo, no momento certo, usando dados reais de compra para aumentar o faturamento automaticamente."*

**O que o cliente compra:** não um CRM, mas **"faturamento adicional que eu não teria sem isso"** — com prova de ROI auditável.

---

#### 2. FLUXO DE VALOR (caminho do dinheiro)

```
INTEGRAÇÃO → CLIENTE → SEGMENTAÇÃO → CAMPANHA → MENSAGEM → PEDIDO →   ROI
  (dado)     (ativo)  (inteligência)  (ação)     (canal) (receita)  (prova)
```

Todo componente do sistema existe para servir essa cadeia. O elo mais frágil e mais crítico é **WhatsApp + prova de ROI** — sem ROI visível, o restaurante cancela no segundo mês.

---

#### 3. ESCOPO DO MVP ("Máquina de Reativação")

| Módulo | Status MVP | Descrição |
|---|---|---|
| Integração (1 fonte: Anota AI / Cardápio Web) | **MUST** | Ingestão de pedidos via webhook |
| Clientes (unificação por telefone) | **MUST** | Base centralizada, o ativo central |
| Segmentação RFM (4 segmentos fixos) | **MUST** | Campeões, Novos, Em Risco, Inativos |
| Campanhas manuais WhatsApp | **MUST** | Template + variáveis + disparo |
| Dashboard de ROI | **MUST** | Enviados → pedidos → R$ |
| Automações | SHOULD | Reativação, aniversário, boas-vindas |
| Cupons/ofertas | SHOULD | Dentro da campanha |
| Fidelização, multicanal, IA | WON'T (agora) | Fases posteriores |

**Decisões de fundador travadas:**
- Canal WhatsApp: **API não-oficial (Z-API)**
- Integração de entrada: **Anota AI / Cardápio Web**

---

#### 4. ARQUITETURA DE ALTO NÍVEL

##### 4.1 — Estilo arquitetural

**Monólito Modular** em NestJS, com **API e Workers como processos separados**. Não microsserviços — seria overengineering no MVP. Os módulos têm fronteiras claras para extração futura *quando a escala exigir*.

##### 4.2 — Diagrama de componentes

```txt
┌──────────────────────────────────────────────────────────┐
│  FRONTEND — React + Vite + Tailwind + Shadcn + Recharts   │
│  (Vercel / Cloudflare Pages)                              │
└───────────────────────────┬──────────────────────────────┘
                            │ REST / JSON (JWT) — contrato OpenAPI
                            ▼
┌──────────────────────────────────────────────────────────┐
│  API — NestJS (modular monolith)                          │
│  Auth │ Tenant │ Restaurants │ Integrations │ Customers   │
│  Orders │ Segments │ Campaigns │ Messaging │ Analytics    │
│  Middleware: TenantContext (RLS) + RateLimit + Validation │
└──────┬───────────────────────┬─────────────────┬─────────┘
       │                       │                 │
       ▼                       ▼                 ▼
┌─────────────┐      ┌──────────────────┐  ┌──────────────┐
│ PostgreSQL  │      │  Redis + BullMQ  │  │  Z-API       │
│ (RLS multi- │      │  (filas/cache)   │  │ (WhatsApp)   │
│  tenant)    │      └────────┬─────────┘  └──────────────┘
└─────────────┘               │
                              ▼
              ┌───────────────────────────────┐
              │   WORKERS (NestJS standalone)  │
              │  integration.ingest            │
              │  segmentation.recalculate      │
              │  campaign.dispatch (rate-lim)  │
              │  conversion.attribution        │
              │  message.status                │
              └───────────────────────────────┘
                              ▲
                              │ Webhooks (HMAC)
              ┌───────────────┴───────────────┐
              │  Anota AI / Cardápio Web       │
              └───────────────────────────────┘
```

##### 4.3 — Stack tecnológica oficial

| Camada | Tecnologia | Versão alvo |
|---|---|---|
| Frontend | React + Vite, Tailwind, Shadcn/UI, Recharts | — |
| Backend | NestJS + TypeScript | Node 20 LTS |
| ORM | Drizzle ORM + node-postgres | — |
| Banco | PostgreSQL | 16+ |
| Cache/Filas | Redis + BullMQ | Redis 7 |
| WhatsApp | Z-API (não-oficial), isolado atrás de adapter | — |
| Auth | JWT (access + refresh) | — |
| Logs | nestjs-pino (structured) | — |
| Erros | RFC 7807 Problem Details | — |
| API Contract | OpenAPI code-first (@nestjs/swagger) | 3.0 |
| Observabilidade | Pino + Grafana/Loki + Sentry + Bull Board | — |
| Hospedagem | Railway/Render (início) → AWS (escala) | — |

---

#### 5. MODELO DE DOMÍNIO

##### 5.1 — Hierarquia de tenancy

```txt
ACCOUNT (tenant — unidade de cobrança e isolamento)
   ├── type = 'direct'  → dono de restaurante (1, raramente N)
   └── type = 'agency'  → agência que opera N restaurantes de clientes
        │
        └── RESTAURANT (a operação — dona da base de clientes)
             ├── Integration
             ├── Customer → Order → OrderItem
             ├── Segment ↔ CustomerSegment
             └── Campaign → CampaignTarget → MessageLog
                              Conversion (liga Campaign+Customer+Order)
```

**Regra de ouro do isolamento:**
- `account_id` = fronteira de **segurança** (RLS no banco)
- `restaurant_id` = fronteira de **escopo operacional** (aplicação, via `user_restaurant_access`)
- Clientes e pedidos **nunca** são compartilhados entre restaurantes.

##### 5.2 — Entidades núcleo

| Entidade | Propósito |
|---|---|
| `account` | Quem paga e é isolado (direct/agency) |
| `app_user` | Operadores do painel |
| `user_restaurant_access` | Escopo de acesso (chave para agências) |
| `restaurant` | A operação real |
| `subscription` | Plano/cobrança, limites |
| `integration` | Fonte de dados (Anota AI / Cardápio Web) |
| `customer` | O ativo central (telefone E.164 + agregados RFM) |
| `order` / `order_item` | Pedidos importados (particionados por mês) |
| `segment` / `customer_segment` | Classificação RFM (snapshot versionado) |
| `campaign` | Campanha + agregados materializados de ROI |
| `campaign_target` | Snapshot **imutável** do alvo no disparo |
| `message_log` | Cada mensagem Z-API + status (particionado) |
| `conversion` | Atribuição pedido↔campanha (a prova de ROI) |
| `webhook_event` | Caixa-preta de ingestão (auditoria + replay) |

##### 5.3 — Regras invioláveis de domínio

1. Todo dado operacional pertence a **um** restaurante e **uma** account.
2. `Customer.phone` (E.164) é a chave de unificação **dentro de um restaurante**.
3. `CampaignTarget` e `Conversion` são **imutáveis** (auditoria de ROI).
4. Um pedido conta para **uma única** campanha (`UNIQUE(order_id)` em conversion).
5. Só clientes com `consent_whatsapp = true` entram em campanhas (LGPD).

---

#### 6. FLUXOS DE NEGÓCIO

##### 6.1 — Ingestão (Integração → Base)
```txt
Webhook Anota AI (HMAC) → persiste bruto (webhook_event) → 200 imediato
  → [fila integration.ingest] → adapter normaliza → upsert customer (E.164)
  → insert order idempotente → atualiza agregados
  → emite order.created + customer.updated
```

##### 6.2 — Segmentação RFM
```txt
customer.updated OU job diário → [fila segmentation.recalculate]
  → calcula R,F,M por PERCENTIL dentro do restaurante
  → classifica em 4 segmentos fixos → atualiza customer_segment
```

##### 6.3 — Disparo de campanha (caminho do dinheiro)
```txt
Operador: segmento → mensagem → revisão → dispatch (Idempotency-Key)
  → valida WhatsApp conectado + segmento não-vazio
  → snapshot targets (INSERT...SELECT, não loop)
  → campaign.status = sending
  → [fila campaign.dispatch — RATE-LIMITED anti-ban]
  → por target: render → zapi.send → message_log → respeita rate limit
```

##### 6.4 — Atribuição de conversão (o ROI)
```txt
order.created → [fila conversion.attribution]
  → cliente foi target nos últimos N dias (janela)?
  → sim: cria conversion (UNIQUE order_id) → atualiza agregados da campaign
```

---

#### 7. PERSISTÊNCIA E ESCALA

##### 7.1 — Multi-tenant
**Shared Database + Shared Schema + RLS** por `account_id`. Contexto injetado via `SET LOCAL app.account_id` em transação (seguro com pool). Usuário de banco **sem** `BYPASSRLS`.

##### 7.2 — Particionamento
`order` e `message_log` particionados por mês (`RANGE` em `ordered_at`/`created_at`). `pg_partman` cria partições automaticamente; partições > 24 meses são arquivadas.

##### 7.3 — Índices
Todo índice de tabela operacional **lidera por `restaurant_id`/`account_id`**. Índices parciais (`WHERE status='pending'`, `is_current=true`, `deleted_at IS NULL`) reduzem tamanho drasticamente.

##### 7.4 — Dimensionamento alvo
```txt
10.000 restaurantes × ~5.000 clientes  → 50M customers
× ~30 pedidos histórico                → centenas de milhões de orders
campanhas/mês                          → dezenas de milhões de message_logs/mês
```

##### 7.5 — Estratégia de escala

| Dimensão | MVP | Escala |
|---|---|---|
| API | 1 instância | Horizontal stateless + LB |
| Workers | 1 worker | Escala por fila; disparo isolado |
| Postgres | Instância única | Read replicas + sub-particionamento por tenant |
| Redis | Instância única | Redis Cluster |
| Z-API | 1 número/restaurante | Pool de números + rotação + warm-up |

---

#### 8. SEGURANÇA

| Vetor | Mitigação |
|---|---|
| Isolamento entre tenants | RLS por `account_id` + `FORCE ROW LEVEL SECURITY` |
| Vazamento via pool | `SET LOCAL` por transação (nunca `SET` global) |
| Webhooks | HMAC-SHA256 sobre corpo bruto + comparação time-safe |
| Credenciais de integração | Criptografadas (AES) no banco |
| Auth | JWT access curto (15min) + refresh (7d) revogável |
| Idempotência | `Idempotency-Key` no dispatch + dedupe em 3 camadas na ingestão |
| Disparo duplicado | `uq_target_once` + Idempotency-Key |
| Headers | Helmet + CORS restrito por origem |
| Validação | DTOs com whitelist + forbidNonWhitelisted |
| LGPD | `consent_whatsapp` (opt-out respeitado em campanhas) |

---

#### 9. OBSERVABILIDADE

| Sinal | Ferramenta | Uso |
|---|---|---|
| Logs estruturados | Pino + Loki | `requestId`, `accountId`, `restaurantId` em todo log |
| Erros | Sentry | Captura de exceções 5xx |
| Filas | Bull Board | Monitoramento de jobs/falhas |
| Alertas críticos | (a definir) | Falha de integração, fila travada, ban Z-API, número desconectado |
| Health | `/health`, `/health/ready` | Liveness + readiness (pg+redis) |

---

#### 10. RISCOS E MITIGAÇÕES

| Risco | Severidade | Mitigação |
|---|---|---|
| **Banimento Z-API** | 🔴 Existencial | Adapter isolado (`WhatsAppProvider`), rate limit + jitter + warm-up, monitoramento de saúde do número, troca para Meta oficial sem refactor |
| **Integração mal escolhida** | 🟠 Alto | Adapter pattern; validar penetração no ICP com Murilo |
| **ROI não convincente** | 🟠 Alto | Snapshot imutável + `UNIQUE(order_id)` + dashboard auditável |
| **Vazamento entre tenants** | 🔴 Crítico | RLS + `SET LOCAL` + sem `BYPASSRLS` + testes |
| **Normalização de telefone** | 🟡 Médio | E.164 no MVP; `libphonenumber-js` como dívida conhecida |
| **Overengineering** | 🟡 Médio | Monólito modular; só Account/Restaurant antecipado |
| **Acoplamento Lovable** | 🟡 Médio | Front desacoplado por contrato REST; eject planejado |

---

#### 11. CUSTOS (MVP, mensal)

```txt
Hospedagem (Railway/Render):  US$ 20–50
PostgreSQL gerenciado:        US$ 15–30
Redis gerenciado:             US$ 10–20
Vercel (frontend):            US$ 0–20
Sentry (free tier):           US$ 0
Z-API (por número):           R$ 100–200 por restaurante
─────────────────────────────────────────
TOTAL infra: ~US$ 70–120 + Z-API por restaurante
```

> **Alerta de pricing:** o custo Z-API escala **linearmente** por restaurante. Deve estar embutido na mensalidade. Decisão comercial pendente com Murilo.

---

#### 12. ROADMAP

| Fase | Entrega |
|---|---|
| **Fase 1** | Paridade com Repediu (MVP atual) |
| **Fase 2** | Melhorias de UX + Automações |
| **Fase 3** | IA preditiva (churn, recompra, recomendação) |
| **Fase 4** | Food Analytics avançado |
| **Fase 5** | Motor de recomendação de campanhas |

#### Cronograma de implementação (~9 semanas)
```txt
Sprint 0  Fundação            [Sem 1]
Sprint 1  Auth/Tenant         [Sem 2]
Sprint 2  Integração/Clientes [Sem 3-4]  ★
Sprint 3  Segmentação RFM     [Sem 5]    ★
Sprint 4  Campanhas/Z-API     [Sem 6-7]  ★ risco
Sprint 5  Dashboard ROI       [Sem 8]    ★
Sprint 6  Hardening/Go-live   [Sem 9]
```

---

#### 13. PENDÊNCIAS ABERTAS (decisões antes de codar)

| # | Pendência | Responsável |
|---|---|---|
| 1 | Nome definitivo do produto | Sócios |
| 2 | Anota AI: webhook push ou polling? | Backend + Anota AI |
| 3 | Identificação do tenant no webhook (payload vs URL única) | Backend + Anota AI |
| 4 | Pricing com custo Z-API embutido | Murilo (comercial) |
| 5 | Penetração da integração no ICP | Murilo (comercial) |

---
---

## PERGUNTA 24 — Architecture Decision Records (ADRs)

> Formato padrão: **Contexto → Decisão → Consequências → Alternativas**. Status: `Aceita` salvo indicação. Cada ADR é imutável; mudanças geram novo ADR que supersede o anterior.

---

### 📄 DOCUMENTO 10 — ADRs

---

#### ADR-001 — Monólito Modular em vez de Microsserviços

**Status:** Aceita
**Data:** Fase 3

**Contexto**
Equipe pequena (3 sócios, 1 dev usando IA como acelerador). MVP precisa ser validado rápido. Microsserviços trariam complexidade operacional (deploy, observabilidade distribuída, consistência eventual entre serviços).

**Decisão**
Adotar **monólito modular** em NestJS, com módulos de fronteiras bem definidas e comunicação interna via eventos (EventEmitter2 → BullMQ). API e Workers rodam como processos separados.

**Consequências**
- ✅ Velocidade de desenvolvimento e deploy simples.
- ✅ Custo operacional baixo.
- ✅ Módulos isolados permitem extração futura para serviços.
- ⚠️ Disciplina de fronteiras é responsabilidade da equipe (sem barreira física).
- ⚠️ Escala vertical até certo ponto antes de exigir refactor.

**Alternativas consideradas**
- *Microsserviços:* rejeitado — overengineering para o MVP.
- *Monólito não-modular:* rejeitado — dificultaria extração futura.

---

#### ADR-002 — Stack Tecnológica Oficial

**Status:** Aceita
**Data:** Fase 3

**Contexto**
Necessidade de stack profissional, escalável, com comunidade grande e independência de fornecedores (não depender de Lovable/Supabase permanentemente).

**Decisão**
- Frontend: **React + Vite + Tailwind + Shadcn/UI + Recharts**
- Backend: **NestJS + TypeScript**
- Banco: **PostgreSQL 16+**
- Cache/Filas: **Redis + BullMQ**

**Consequências**
- ✅ TypeScript end-to-end reduz fricção cognitiva para 1 dev.
- ✅ NestJS impõe estrutura profissional (DI, módulos, guards).
- ✅ PostgreSQL dá independência e recursos avançados (RLS, particionamento).
- ⚠️ Curva de aprendizado de NestJS para dev com background não-tradicional (mitigado por IA).

**Alternativas consideradas**
- *Supabase como backend:* rejeitado — princípio de não-dependência permanente.
- *Express puro:* rejeitado — falta de estrutura para escala.

---

#### ADR-003 — Multi-tenancy via Shared Schema + Row-Level Security

**Status:** Aceita
**Data:** Fase 4

**Contexto**
SaaS para milhares de restaurantes. Três estratégias clássicas: DB-por-tenant, schema-por-tenant, shared-schema. Equipe pequena precisa de baixo custo operacional.

**Decisão**
**Shared Database + Shared Schema + RLS** com `account_id` em todas as tabelas operacionais. Políticas RLS filtram por `current_setting('app.account_id')`. `FORCE ROW LEVEL SECURITY` ativo.

**Consequências**
- ✅ 1 migration para todos os tenants.
- ✅ Custo marginal por tenant próximo de zero.
- ✅ Isolamento garantido no nível do banco (defesa em profundidade).
- ⚠️ Erro de contexto = vazamento de dados entre clientes (mitigado por ADR-006).
- ⚠️ Usuário de banco não pode ter `BYPASSRLS`.

**Alternativas consideradas**
- *DB-por-tenant:* rejeitado — inviável com 10k bancos.
- *Schema-por-tenant:* rejeitado — migrations × 10k, catálogo Postgres inchado.

---

#### ADR-004 — Hierarquia Account → Restaurant (suporte a Agências)

**Status:** Aceita
**Data:** Fase 4

**Contexto**
Murilo atua próximo a agências que gerenciam vários restaurantes. Modelo `Tenant = Restaurant` simples não comportaria esse cenário sem refactor doloroso.

**Decisão**
Separar **Account** (unidade de cobrança/isolamento, tipo `direct` ou `agency`) de **Restaurant** (operação). RLS isola por `account_id`; escopo operacional por `restaurant_id` via `user_restaurant_access`.

**Consequências**
- ✅ Agência adiciona restaurante com 1 INSERT, sem migration.
- ✅ Relatórios consolidados de agência são performáticos (mesma account).
- ✅ Cliente direto = 1 account + 1 restaurant (sem overhead percebido).
- ⚠️ Toda query precisa de dois níveis de filtro (segurança + escopo).

**Alternativas consideradas**
- *Tenant único = Restaurant:* rejeitado — não suporta agências.
- *RLS por restaurant_id:* rejeitado — complicaria relatórios de agência.

---

#### ADR-005 — WhatsApp via Z-API (não-oficial) isolado atrás de Adapter

**Status:** Aceita
**Data:** Fase 1 (decisão de fundador) + Fase 6 (isolamento)

**Contexto**
WhatsApp é o canal de receita. API oficial Meta tem custo e burocracia maiores; Z-API (não-oficial) é mais barata e rápida de integrar, mas tem **risco existencial de banimento**.

**Decisão**
Usar **Z-API no MVP**, totalmente encapsulada atrás de uma interface `WhatsAppProvider`. Nenhum módulo fora de `messaging` sabe que Z-API existe.

**Consequências**
- ✅ Time-to-market rápido, custo baixo.
- ✅ Troca para Meta oficial muda apenas o módulo `messaging`.
- 🔴 Risco de banimento mitigado por ADR-018 (rate limiting).
- ⚠️ Risco jurídico/ToS do WhatsApp — aceito conscientemente no MVP.

**Alternativas consideradas**
- *API oficial Meta:* adiada — custo e burocracia maiores para validação inicial.
- *Acoplamento direto à Z-API:* rejeitado — risco existencial sem saída.

---

#### ADR-006 — Injeção de contexto de tenant via `SET LOCAL` por transação

**Status:** Aceita
**Data:** Fase 6

**Contexto**
RLS depende de `app.account_id` estar setado. Com connection pool, `SET` global vazaria contexto entre requests de tenants diferentes.

**Decisão**
Usar `runInTenantContext()` que abre transação e executa `SELECT set_config('app.account_id', $1, true)` (escopo local, parâmetro bindado). Toda query operacional passa por esse wrapper. Contexto propagado via `AsyncLocalStorage`.

**Consequências**
- ✅ Isolamento seguro mesmo com pool.
- ✅ `set_config` com `$1` elimina injeção no `account_id`.
- ⚠️ Toda operação roda em transação (overhead aceitável).
- ⚠️ Workers também devem setar contexto (account_id no payload do job).

**Alternativas consideradas**
- *`SET` global:* rejeitado — vazamento entre tenants.
- *Filtro só na aplicação:* rejeitado — sem defesa em profundidade.

---

#### ADR-007 — Separação de processos API e Workers

**Status:** Aceita
**Data:** Fase 3

**Contexto**
A API deve responder rápido ao usuário. O trabalho pesado e arriscado (disparo Z-API rate-limited, ingestão em picos) não pode degradar o painel.

**Decisão**
API HTTP (`main.ts`) e Workers (`main.worker.ts`) são processos standalone separados, compartilhando o mesmo código mas escalando independentemente.

**Consequências**
- ✅ Workers escalam por fila sem afetar a API.
- ✅ Falha de disparo não derruba o painel.
- ✅ Rate limiting centralizado nos workers.
- ⚠️ Dois entrypoints para deployar/monitorar.

**Alternativas consideradas**
- *Processamento síncrono na API:* rejeitado — timeout em picos, acoplamento.

---

#### ADR-008 — BullMQ + Redis para processamento assíncrono

**Status:** Aceita
**Data:** Fase 3

**Contexto**
Necessidade de filas para ingestão, segmentação, disparo, atribuição e status. Stack já usa Redis.

**Decisão**
**BullMQ sobre Redis** com `@nestjs/bullmq`. Filas: `integration.ingest`, `segmentation.recalculate`, `campaign.dispatch`, `conversion.attribution`, `message.status`. Redis configurado com `maxmemory-policy noeviction`.

**Consequências**
- ✅ Integração first-class com NestJS (processors como providers).
- ✅ Retry exponencial, jobId determinístico (dedupe), delay/jitter.
- 🔴 `noeviction` é obrigatório — `allkeys-lru` descartaria jobs silenciosamente.
- ⚠️ Cache deve ficar em namespace/instância separada do broker de filas.

**Alternativas consideradas**
- *RabbitMQ/SQS:* rejeitado — Redis já está na stack; menos peças.

---

#### ADR-009 — UUID v7 como Primary Key

**Status:** Aceita
**Data:** Fase 4

**Contexto**
Necessidade de PKs distribuídas, não-enumeráveis, com boa performance de índice em tabelas de altíssimo volume (orders, message_log).

**Decisão**
**UUID v7** (time-ordered) como PK. Fallback `gen_random_uuid()` (v4) aceitável no MVP se a extensão não estiver disponível.

**Consequências**
- ✅ Geração distribuída sem coordenação.
- ✅ Ordenamento temporal evita fragmentação de B-tree em alto volume.
- ✅ Não-enumerável (segurança).
- ⚠️ Depende de extensão `pg_uuidv7` ou geração na aplicação.

**Alternativas consideradas**
- *BIGSERIAL:* rejeitado — enumerável, problemático em multi-tenant.
- *UUID v4:* aceito como fallback, mas pior localidade de índice.

---

#### ADR-010 — Particionamento de tabelas de alto volume por tempo

**Status:** Aceita
**Data:** Fase 4

**Contexto**
Com 10k restaurantes, `order` chega a ~9M linhas/mês e `message_log` a dezenas de milhões/mês. Índices monolíticos ficariam enormes.

**Decisão**
Particionar `order` (por `ordered_at`) e `message_log` (por `created_at`) por **RANGE mensal**. Partições criadas via `pg_partman`. Partições > 24 meses arquivadas.

**Consequências**
- ✅ Índices pequenos por partição; queries de janela temporal rápidas.
- ✅ Arquivamento trivial (detach de partição).
- ✅ Casa com padrão de consulta (RFM, dashboard, atribuição usam janelas).
- ⚠️ PK precisa incluir a chave de partição (`(id, ordered_at)`).
- ⚠️ Joins precisam carregar a coluna de partição (ex.: `order_item.ordered_at`).

**Alternativas consideradas**
- *Tabela única:* rejeitado — índices inviáveis em escala.
- *Particionamento por tenant (hash):* adiado — porta aberta para sub-particionar.

---

#### ADR-011 — Drizzle ORM em vez de TypeORM/Prisma

**Status:** Aceita
**Data:** Fase 6

**Contexto**
RLS exige controle fino da conexão/transação (`SET LOCAL`). ORMs que abstraem demais a conexão dificultam isso.

**Decisão**
**Drizzle ORM + node-postgres**. SQL-first, leve, expõe a conexão (essencial para `runInTenantContext`). Migrations versionadas.

**Consequências**
- ✅ Controle total da conexão para RLS.
- ✅ Type-safety sem geração de cliente pesado.
- ✅ SQL explícito (`INSERT...SELECT`, `ON CONFLICT`) sem fricção.
- ⚠️ Ecossistema menor que Prisma/TypeORM.

**Alternativas consideradas**
- *Prisma:* rejeitado — abstração de conexão dificulta `SET LOCAL`.
- *TypeORM:* rejeitado — pesado, esconde a conexão.

---

#### ADR-012 — ROI auditável via snapshots imutáveis

**Status:** Aceita
**Data:** Fase 2 + Fase 4

**Contexto**
O ROI é o elo existencial (combate ao churn). O número precisa ser defensável mesmo que o cliente mude de segmento depois.

**Decisão**
- `campaign_target` congela snapshot (telefone, nome, segmento) no disparo.
- `conversion` tem `UNIQUE(order_id)` — um pedido conta para uma única campanha.
- Agregados de ROI materializados em `campaign` (sem recomputar).
- `campaign_target` e `conversion` são imutáveis.

**Consequências**
- ✅ ROI auditável e conservador (a favor da credibilidade).
- ✅ Dashboard rápido (lê agregado, não recomputa).
- ✅ Número não muda retroativamente.
- ⚠️ Snapshots duplicam dados (custo de storage aceitável).

**Alternativas consideradas**
- *Calcular ROI on-the-fly:* rejeitado — número instável, não-auditável.
- *Atribuir pedido a múltiplas campanhas:* rejeitado — infla ROI, perde credibilidade.

---

#### ADR-013 — RFM por percentis dentro de cada restaurante

**Status:** Aceita
**Data:** Fase 2

**Contexto**
Um restaurante de alto ticket tem realidade diferente de uma marmitaria. Thresholds globais de RFM seriam injustos.

**Decisão**
Calcular Recência, Frequência e Monetário por **percentis dentro de cada restaurante** (não thresholds globais). 4 segmentos fixos: Campeões, Novos, Em Risco, Inativos.

**Consequências**
- ✅ Segmentação relevante para cada realidade de negócio.
- ✅ Sem construtor de filtros no MVP (simplicidade).
- ⚠️ Recálculo precisa de janela de dados suficiente (restaurante novo tem RFM pobre).

**Alternativas consideradas**
- *Thresholds globais:* rejeitado — injusto entre tipos de restaurante.
- *Construtor de segmentos:* adiado para fase posterior (COULD).

---

#### ADR-014 — Webhooks: "receber rápido, processar depois" + idempotência tripla

**Status:** Aceita
**Data:** Fase 6

**Contexto**
A Anota AI tem timeout no webhook. Picos de almoço/jantar geram muitos pedidos simultâneos. Processar síncrono estouraria o timeout → reenvio → duplicação.

**Decisão**
Webhook valida HMAC, persiste payload bruto em `webhook_event`, enfileira em `integration.ingest` e responde **200 imediatamente**. Processamento no worker. Idempotência em 3 camadas:
1. `uq_webhook_dedupe` (banco)
2. `jobId` determinístico (BullMQ)
3. `uq_order_external` (upsert)

**Consequências**
- ✅ Absorve picos com backpressure.
- ✅ `webhook_event` permite replay em caso de bug no adapter.
- ✅ Processar duas vezes é impossível (defesa tripla).
- ⚠️ Latência entre recebimento e disponibilidade do dado (segundos).

**Alternativas consideradas**
- *Processamento síncrono:* rejeitado — timeout e duplicação em picos.

---

#### ADR-015 — Validação de assinatura HMAC sobre corpo bruto

**Status:** Aceita
**Data:** Fase 6

**Contexto**
`JSON.stringify` reordena chaves e muda o hash. Validar HMAC sobre objeto reparseado quebraria a verificação.

**Decisão**
HMAC-SHA256 calculado sobre o **corpo bruto** (`@RawBody()`, requer `rawBody: true`), comparação **time-safe** (`timingSafeEqual`).

**Consequências**
- ✅ Verificação correta e resistente a timing attack.
- ⚠️ Requer configuração de `rawBody` no bootstrap.

**Alternativas consideradas**
- *HMAC sobre objeto parseado:* rejeitado — hash inconsistente.
- *Comparação com `===`:* rejeitado — vulnerável a timing attack.

---

#### ADR-016 — Idempotency-Key obrigatória no disparo de campanha

**Status:** Aceita
**Data:** Fase 6

**Contexto**
Duplo-clique ou retry de rede poderia disparar a campanha duas vezes = cliente recebe 2 mensagens = banimento + reclamação.

**Decisão**
`POST .../dispatch` exige header `Idempotency-Key`. Chave registrada no Redis (`SETNX` TTL 24h). Combinada com `uq_target_once` no banco.

**Consequências**
- ✅ Disparo nunca duplica (defesa em duas camadas).
- ✅ Retry seguro retorna estado atual sem re-disparar.
- ⚠️ Front precisa gerar e enviar a chave.

**Alternativas consideradas**
- *Sem idempotência:* rejeitado — risco de banimento.

---

#### ADR-017 — Rate limiting anti-ban por restaurante (token bucket)

**Status:** Aceita
**Data:** Fase 3 + Fase 6

**Contexto**
Z-API não-oficial: disparo em massa = banimento = produto morto. Cada restaurante tem seu número.

**Decisão**
`campaign.dispatch` roda com **rate limiting + jitter + warm-up** via token bucket no Redis, **por restaurante** (`ratelimit:zapi:{restaurant_id}`). Envio gradual; estimativa de tempo comunicada ao usuário.

**Consequências**
- ✅ Isola risco: um restaurante não derruba o número de outro.
- ✅ Transparência (UX mostra "envio levará ~X min para proteger seu número").
- ⚠️ Throughput limitado de propósito — disparo de 10k leva horas.

**Alternativas consideradas**
- *Disparo imediato em massa:* rejeitado — banimento garantido.

---

#### ADR-018 — Erros padronizados via RFC 7807 (Problem Details)

**Status:** Aceita
**Data:** Fase 6

**Contexto**
Front precisa de respostas de erro previsíveis. Erros de negócio precisam ser tipados e mapeáveis.

**Decisão**
Global Exception Filter retorna **RFC 7807** (`type`, `title`, `status`, `detail`, `instance`, `requestId`). Erros de domínio via classe `DomainError` com catálogo central (`Errors.*`).

**Consequências**
- ✅ Front trata erros de forma uniforme.
- ✅ Erros de negócio rastreáveis por `code`/`type`.
- ✅ `requestId` correlaciona erro com logs.

**Alternativas consideradas**
- *Formato ad-hoc:* rejeitado — inconsistente, difícil de tratar no front.

---

#### ADR-019 — Contrato de API: OpenAPI code-first

**Status:** Aceita
**Data:** Fase 6

**Contexto**
Front desacoplado precisa de contrato confiável. Manter YAML manual diverge do código.

**Decisão**
**Code-first com `@nestjs/swagger`**: OpenAPI gerado dos DTOs decorados (`@ApiProperty`). Export de `openapi.json`; front gera tipos via `openapi-typescript`.

**Consequências**
- ✅ Contrato nunca diverge do código.
- ✅ Front 100% tipado, sem duplicação manual.
- ⚠️ DTOs precisam ser bem decorados.

**Alternativas consideradas**
- *Spec-first (YAML manual):* rejeitado — diverge do código com o tempo.

---

#### ADR-020 — Frontend desacoplado e eject planejado do Lovable

**Status:** Aceita
**Data:** Fase 5

**Contexto**
Frontend inicial gerado no Lovable, mas princípio de não-dependência permanente. ROI calculado no backend.

**Decisão**
Front fala com a API **só por contrato REST** (sem lógica de negócio). `revenue_attributed` vem pronto do backend (agregado materializado). Estado "sending" via **polling** (sem WebSocket no MVP). Eject do Lovable assim que estabilizar.

**Consequências**
- ✅ Front substituível sem afetar backend.
- ✅ ROI consistente (uma fonte de verdade).
- ⚠️ Polling a cada ~5s durante disparo (carga aceitável).

**Alternativas consideradas**
- *Lógica de ROI no front:* rejeitado — número inconsistente.
- *WebSocket no MVP:* adiado — polling resolve, menos complexidade.

---

#### ADR-021 — Criptografia de credenciais de integração no banco

**Status:** Aceita
**Data:** Fase 6

**Contexto**
Tokens/credenciais de Anota AI são armazenados em `integration.credentials`. Vazamento de banco não pode expor credenciais de terceiros.

**Decisão**
Credenciais criptografadas (AES) na aplicação antes de persistir, usando `CREDENTIALS_ENCRYPTION_KEY` (32 bytes). Decriptadas só em runtime no momento do uso.

**Consequências**
- ✅ Dump de banco não expõe credenciais em claro.
- ⚠️ Gestão da chave de criptografia (rotação, secret management) — dívida para produção.

**Alternativas consideradas**
- *Texto plano:* rejeitado — risco de segurança inaceitável.
- *Secret manager externo (Vault):* adiado — overengineering no MVP.

---

### 📋 ÍNDICE DE ADRs

| ADR | Decisão | Severidade |
|---|---|---|
| 001 | Monólito Modular | Estrutural |
| 002 | Stack oficial (NestJS/React/PG/Redis/BullMQ) | Estrutural |
| 003 | Multi-tenancy Shared Schema + RLS | 🔴 Crítica |
| 004 | Hierarquia Account → Restaurant | 🔴 Crítica |
| 005 | Z-API isolada atrás de adapter | 🔴 Existencial |
| 006 | `SET LOCAL` por transação | 🔴 Crítica |
| 007 | Separação API/Workers | Estrutural |
| 008 | BullMQ + Redis (noeviction) | Estrutural |
| 009 | UUID v7 | Média |
| 010 | Particionamento temporal | Alta |
| 011 | Drizzle ORM | Média |
| 012 | ROI auditável (snapshots imutáveis) | 🔴 Existencial |
| 013 | RFM por percentil | Alta |
| 014 | Webhooks receber-rápido + idempotência tripla | Alta |
| 015 | HMAC sobre corpo bruto | Alta |
| 016 | Idempotency-Key no dispatch | Alta |
| 017 | Rate limiting anti-ban | 🔴 Existencial |
| 018 | RFC 7807 | Média |
| 019 | OpenAPI code-first | Média |
| 020 | Front desacoplado / eject Lovable | Média |
| 021 | Criptografia de credenciais | Alta |

---

### 🎯 FECHAMENTO DA FASE 7

A documentação está completa. O conjunto final de artefatos:

```txt
01 - Visão do Produto          ✅ (Fase 1)
02 - Escopo MVP                ✅ (Fase 1)
03 - Roadmap                   ✅ (Fase 3 + SAD §12)
04 - Domain Model              ✅ (Fase 2)
05 - Arquitetura (SAD)         ✅ (este documento, P23)
06 - Banco de Dados            ✅ (Fase 4)
07 - APIs                      ✅ (Fase 6)
08 - UX                        ✅ (Fase 5)
09 - Prompts Lovable           ✅ (Fase 5)
10 - ADRs                      ✅ (este documento, P24)
11 - Plano de Desenvolvimento  ✅ (Fase 3 + SAD §12)
```

#### Recomendação final do CTO

Antes da primeira linha de código de produção, **destravem as 5 pendências abertas** (SAD §13) — especialmente as 3 técnicas do webhook Anota AI (push vs polling, identificação do tenant) e o pricing com Z-API embutido. São baratas de resolver agora e caras de descobrir depois.

O sistema está pensado para **vender no dia 1 e escalar para milhares de restaurantes sem reestruturação**. A disciplina daqui pra frente é simples: **implementar o que está documentado, resistir ao overengineering, e proteger os dois elos existenciais — Z-API (banimento) e ROI (credibilidade)**.

Documentação encerrada. Pronto para Sprint 0.