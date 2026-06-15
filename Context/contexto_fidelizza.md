# 📘 Contexto Geral — Fidelizza

> Documento de referência condensado. Substitui o `Planejamento_consolidado.md` (Fases 1–7). Enxuto, mas sem perder o essencial: tese, escopo, domínio, arquitetura, decisões e riscos. Duas alterações desta versão: **equipe atualizada** e **WhatsApp migrado de Z-API para API oficial Meta (BSP)**.

---

## 1. Tese do produto

Fidelizza = **"Máquina de Reativação via WhatsApp com ROI provado"**. CRM de reativação para restaurantes de delivery.

O restaurante não compra "um CRM". Compra **faturamento adicional que não teria sem isso** — recuperar inativos e aumentar frequência sem depender do iFood. O dinheiro nasce na **conversão da campanha**, não no software.

**Caminho do dinheiro (elos irredutíveis):**
```
INTEGRAÇÃO → BASE DE CLIENTES → SEGMENTAÇÃO RFM → CAMPANHA WHATSAPP → PEDIDO → ROI
  (dado)        (ativo)         (inteligência)       (canal)       (receita) (prova)
```
Se um elo quebra, o produto não vende. Os dois mais frágeis e existenciais: **entregabilidade do WhatsApp** (sem ela não há canal) e **ROI visível** (sem ele há churn no 2º mês).

---

## 2. Escopo do MVP

**MVP recomendado:** 1 integração + base de clientes + RFM (4 segmentos fixos) + campanha manual via WhatsApp + 1 dashboard de ROI.

**Cortes deliberados:** segmentação fixa (sem construtor de filtros); campanha manual (sem automação); ROI por atribuição simples (recebeu campanha + pediu em até N dias = conversão).

### MoSCoW (condensado)
| Nível | Itens |
|---|---|
| **MUST** | 1 integração de entrada · Clientes (importação + unificação por telefone) · RFM (Campeões, Novos, Em Risco, Inativos) · Campanha manual WhatsApp · Dashboard de ROI |
| **SHOULD** (pós-MVP) | Automações (reativação/aniversário/boas-vindas) · Cupons na campanha · Métricas (ticket médio, frequência, retenção) |
| **COULD** (com tração) | Fidelização (clube VIP/pontos) · Segmentação avançada · Mais integrações |
| **WON'T (agora)** | IA preditiva · Food analytics · Multicanal (SMS/e-mail/push) · iFood |

---

## 3. Modelo de domínio

**Entidades núcleo:** `Account` · `Restaurant` · `User` · `Integration` · `Customer` · `Order` · `OrderItem` · `Segment` · `CustomerSegment` · `Campaign` · `CampaignTarget` · `MessageLog` · `Conversion`.

**Coração do ROI:** `CampaignTarget` (snapshot de quem foi alvo), `MessageLog` (o que foi enviado + status), `Conversion` (quem pediu depois). Sem esses três, não há prova de ROI.

**Detalhe crítico:** `CampaignTarget` **congela** o cliente no momento do disparo (telefone, segmento, nome). Garante ROI **auditável e imutável** mesmo que o cliente mude de segmento depois.

**Atributos-chave:** `Customer.phone` em E.164 (chave de unificação) + agregados (`total_orders`, `total_spent`, `avg_ticket`, `last_order_at`, RFM); `Order.external_id` (idempotência da integração); `Campaign.attribution_window_days` (default 7).

### Fluxos de negócio
1. **Ingestão:** webhook/polling da integração → fila `integration.ingest` → normaliza → idempotência por `external_id` → upsert Customer (phone) → cria Order → atualiza agregados → evento `customer.updated`.
2. **Segmentação:** `customer.updated` ou job diário → fila `segmentation.recalculate` → R/F/M por **percentil dentro do restaurante** → classifica nos 4 segmentos → atualiza `CustomerSegment`.
3. **Campanha:** operador escolhe segmento → escreve mensagem (template + `{nome}`) → cria Campaign (draft) → disparar → snapshot dos targets → fila `campaign.dispatch` (com controle de taxa) → envia → `MessageLog`.
4. **Status:** webhook do provedor (sent/delivered/read/failed) → fila `message.status` → atualiza MessageLog + CampaignTarget.
5. **Atribuição (ROI):** `order.created` → fila `conversion.attribution` → cliente foi target nos últimos N dias? → cria Conversion → dashboard reflete enviados → entregues → pedidos → R$.

> **RFM por percentil dentro de cada restaurante**, não thresholds globais: um restaurante de alto ticket tem realidade diferente de uma marmitaria.

---

## 4. Arquitetura

**Monólito modular** em NestJS (não microsserviços — seria overengineering no MVP). **API** e **Workers** como processos separados (`main.ts` / `main.worker.ts`): a API responde rápido, os Workers fazem o trabalho pesado/arriscado (disparo com controle de taxa).

```
Frontend (React 19 + TanStack Start/Router/Query + Tailwind/Shadcn/Recharts)
   ⚠️ realidade do repo: telas já esboçadas, hoje com dados MOCK e login simulado;
      stack diverge do "Vite puro + Lovable" previsto. Falta integração com a API.
        │ REST/JSON (JWT)
API NestJS (modular monolith)
  módulos: auth · tenant · restaurant · integrations · customers ·
           orders · segments · campaigns · messaging · analytics · queues
  middleware: TenantContext + RateLimit + Validation
        ├─ PostgreSQL (multi-tenant RLS)
        ├─ Redis + BullMQ (filas, cache, rate limit)
        └─ WhatsApp Cloud API (oficial, via BSP) ── isolada atrás de adapter
Workers (BullMQ): integration.ingest · segmentation.recalculate ·
                  campaign.dispatch · conversion.attribution · message.status
        ▲ webhooks: Integração de entrada + Provedor WhatsApp
```

**Multi-tenancy (decisão estrutural):**
```
ACCOUNT (direct | agency) → fronteira de cobrança + segurança (RLS)
RESTAURANT               → escopo operacional (clientes, pedidos, campanhas)
```
`account_id` é a fronteira de segurança (RLS). `restaurant_id` é o escopo dentro da conta. **Clientes e pedidos NUNCA cruzam restaurantes**, mesmo na mesma agência.

**Comunicação interna:** módulos não se chamam direto em fluxos assíncronos — emitem **eventos** (EventEmitter2) que enfileiram no BullMQ. Mantém desacoplamento e prepara extração futura de serviços.

**Princípio-seguro:** o módulo `messaging` **encapsula totalmente** o provedor de WhatsApp. Trocar de provedor muda só esse módulo — o resto do sistema não sabe qual provedor existe.

---

## 5. WhatsApp — decisão revisada ⚠️ (mudança desta versão)

**Antes:** Z-API (API **não-oficial**), número próprio por restaurante, ~R$100–200/número, com toda a maquinaria anti-ban (warm-up + rate limit agressivo + jitter) porque banimento = produto morto.

**Agora:** **API oficial Meta (WhatsApp Cloud API), via BSP** (ex.: Twilio ou Infobip) — BSP final a confirmar (ver §8).

### Por que mudar — leitura de PMO honesta
- **Risco (motivo mais forte):** o planejamento original classifica banimento do número como risco **🔴 existencial**. A API oficial **elimina esse risco**. Esse é o ganho real da troca.
- **Custo (atenção — não é tão óbvio):** Z-API tem custo **fixo por número**. A API oficial é **por mensagem/conversa**, e as campanhas de reativação caem na categoria **Marketing** (a mais cara, **sem desconto por volume**). Em volume alto de disparo, o modelo variável **pode custar mais** que o fixo do Z-API. Conclusão: a troca **não garante economia** — depende do volume de disparo por restaurante. Precisa entrar no pricing antes do go-live.
- **Desenvolvimento (quase neutro):** sai a maquinaria anti-ban pesada; entra **aprovação de templates (HSM) pela Meta**, **opt-in/consent** (já modelado em `consent_whatsapp`), **janela de 24h** e billing por mensagem. Saldo de esforço ~equivalente; o adapter (já previsto) torna a troca barata em código.

### Implicações que o desenvolvimento precisa absorver
1. **Templates aprovados pela Meta** antes de disparar (há fila de aprovação — começar cedo).
2. **Opt-in obrigatório** por cliente (`consent_whatsapp`) — sem consentimento, sem disparo.
3. **Janela de serviço de 24h** (resposta do cliente abre janela gratuita; fora dela, só template pago).
4. **Categoria da mensagem importa para custo** (Marketing >> Utility) — refletir no relatório de ROI/custo.
5. **Rate limit não some** — muda de função: passa a respeitar os **tiers de mensagens da Meta** (1K→10K→100K→ilimitado) e a **quality rating** do número, não mais a evitar ban de API não-oficial. O warm-up vira "rampa de tier".

> O adapter `messaging` continua sendo o seguro de vida da arquitetura: ele isola qual BSP/provedor está por trás.

---

## 6. Equipe (atualizada — mudança desta versão)

| Papel | Quem | Responsabilidade |
|---|---|---|
| **Stakeholder / Decisão** | **Você** | Verificação humana, decisão de negócio, supervisão e **QA manual** de cada sprint. |
| **Executor** | **Claude Code (VS Code)** | Desenvolvimento conforme cronograma e prompts. |
| **PMO / Apoio à decisão** | **Claude (PMO)** | Planejamento, prompts para o Executor, revisão contra critérios de aceite, gestão de riscos e pendências. |
| **Integração** | **WhatsApp Cloud API (BSP)** + **Integração de entrada** (Anota.AI / Cardápio Web) | Canal de envio (oficial Meta) e fonte de dados de pedidos. |

---

## 7. Decisões de arquitetura (ADRs condensados)

| ADR | Decisão | Severidade |
|---|---|---|
| 001 | Monólito modular | Estrutural |
| 002 | Stack NestJS / React / PG / Redis / BullMQ | Estrutural |
| 003 | Multi-tenancy Shared Schema + RLS | 🔴 Crítica |
| 004 | Hierarquia Account → Restaurant | 🔴 Crítica |
| **005** | **WhatsApp Cloud API oficial (BSP) isolada atrás de adapter** *(revisado: era Z-API)* | 🔴 Existencial |
| 006 | `SET LOCAL` por transação (contexto de tenant) | 🔴 Crítica |
| 007 | Separação API / Workers | Estrutural |
| 008 | BullMQ + Redis (`noeviction`) | Estrutural |
| 009 | UUID v7 | Média |
| 010 | Particionamento temporal de `orders` | Alta |
| 011 | Drizzle ORM | Média |
| 012 | ROI auditável (snapshots imutáveis) | 🔴 Existencial |
| 013 | RFM por percentil dentro do restaurante | Alta |
| 014 | Webhooks "receber rápido" + idempotência tripla | Alta |
| 015 | HMAC sobre corpo bruto (`rawBody`) | Alta |
| 016 | Idempotency-Key no dispatch de campanha | Alta |
| **017** | **Rate limiting por restaurante — agora respeitando tiers/quality da Meta** *(reframado: era anti-ban Z-API)* | Alta |
| 018 | Erros padronizados RFC 7807 | Média |
| 019 | OpenAPI code-first (`@nestjs/swagger`) | Média |
| 020 | Frontend desacoplado + eject do Lovable | Média |
| 021 | Criptografia de credenciais de integração no banco (AES) | Alta |

---

## 8. Riscos e pendências

### Riscos principais
| Risco | Severidade | Mitigação |
|---|---|---|
| Entregabilidade WhatsApp (quality rating / bloqueio Meta) | 🔴 Existencial | API oficial + opt-in rígido + templates aprovados + respeitar tiers e rampa |
| ROI não convincente | 🟠 Alto | Atribuição simples e transparente + snapshot imutável + dashboard auditável |
| Custo de WhatsApp maior que o previsto (Marketing sem desconto) | 🟠 Alto | Embutir no pricing; medir custo por campanha; usar janela 24h quando possível |
| Integração de entrada mal escolhida | 🟠 Alto | Adapter pattern (trocar/somar fontes sem refactor); validar penetração no ICP |
| Acoplamento ao Lovable | 🟡 Médio | Front desacoplado por contrato REST; eject planejado |
| Overengineering | 🟡 Médio | Monólito modular; só Account×Restaurant antecipado |

### Pendências de negócio (decisão sua 🔴)
| # | Pendência | Quem decide |
|---|---|---|
| 1 | **BSP de WhatsApp** (Twilio = dev rápido/melhor doc, markup $0.005/msg · Infobip = forte no Brasil/LATAM, onboarding mais enterprise · ou **Cloud API direto** = sem markup) | Você + Murilo |
| 2 | **Verificação Meta Business + aprovação de templates** (tem prazo — iniciar cedo) | Você / Dev |
| 3 | **Integração de entrada** definitiva (Anota.AI vs Cardápio Web — penetração no ICP) | Você + Murilo/França |
| 4 | **Webhook da integração:** push ou polling? Tenant via payload ou URL única? | Dev + fornecedor |
| 5 | **Credenciais de dev da integração** (burocracia de liberação) | Murilo |
| 6 | **Pricing com custo de WhatsApp embutido** | Murilo |

---

## 9. Estado atual (reconciliado com o commit `524ec0f` — "Sprint 1 - Update 50%")

**Fundação (Sprint 0/0.5): ✅ na prática.** `main.ts` (helmet/CORS/ValidationPipe/shutdown/Pino) + `main.worker.ts`; `/health/ready` (PG+Redis); `RedisService`; migration multi-tenant (`account`/`app_user`/`user_restaurant_access` + `account_id`) com RLS policies e `runInTenantContext` (`SET LOCAL` bindado). Faltam: Sentry, Swagger, UUID v7, filtro RFC 7807 completo.

**Sprint 1 (Auth + Tenant + Restaurant): ~80% no backend — REPROVADO no QA** por 2 bloqueantes:
- 🔴 **Isolamento multi-tenant não está ativo.** RLS existe mas é letra morta: a app conecta como `fidelizza` (superuser, ignora RLS), não há `FORCE ROW LEVEL SECURITY` nem role de app dedicada, e as queries de `restaurants` não filtram `account_id` (confiam só na RLS). Resultado: vazamento entre contas.
- 🔴 **`refresh()` degrada o token:** o refresh é assinado só com `sub`, então o novo access token perde `accountId`/`role`/`allowedRestaurantIds`.

Bem feito (crédito): auth completo (bcrypt, refresh revogável no Redis, payload correto), AsyncLocalStorage + interceptor global, `JwtAuthGuard` global, `RestaurantAccessGuard`, `restaurants` CRUD ligado ao contexto.

**Frontend:** telas esboçadas (React 19 + TanStack Start/Router/Query + Shadcn), porém **login ainda mockado e sem cliente de API** — integração pendente. Stack diverge do "Vite + Lovable" do plano.

**Próximo passo real:** corrigir os 2 bloqueantes (RLS efetiva + refresh) e fechar o QA do Sprint 1 antes de avançar.

> Backlog de correção detalhado, integração BE↔FE e portões de QA: ver `cronograma_fidelizza_v2.md`.
