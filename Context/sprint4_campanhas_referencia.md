# 📣 Sprint 4 — Campanhas + WhatsApp Oficial (Twilio) — Elo 3 ⚠️ MAIOR RISCO
> Documento de referência da sessão. Este é o elo existencial do produto: sem entregabilidade, não há canal.
> Status: ⬜ A iniciar

---

## 🎯 Meta

Criar e disparar uma campanha de reativação via **WhatsApp Cloud API através do Twilio**, com controle de taxa, opt-in obrigatório, templates aprovados e rastreio de status de entrega. A mensagem real precisa chegar num número de teste.

---

## ⚠️ Por que este é o sprint de maior risco

1. **Entregabilidade é existencial** — número banido ou de baixa quality rating = produto morto. A API oficial elimina o risco de ban, mas introduz: templates aprovados, opt-in rígido, janela de 24h e tiers da Meta.
2. **Custo variável** — campanhas de reativação caem na categoria **Marketing** (a mais cara, sem desconto por volume). Precisa ser medido por campanha e refletido no ROI (Sprint 5).
3. **Dependência externa de aprovação** — templates e verificação Meta têm fila. O sandbox do Twilio mitiga isso no desenvolvimento.

---

## 🔌 Decisão de BSP: Twilio

**Por quê:** sandbox funciona sem verificação Meta aprovada (permite testar o Sprint 4 enquanto a verificação tramita), SDK Node excelente, documentação superior, tempo até funcionar de 1–2 dias. Custo extra de ~$0,005/msg é irrelevante no volume MVP.

**Isolamento (ADR-005):** todo o Twilio fica encapsulado no módulo `messaging` atrás da interface `WhatsAppProvider`. Migrar para Cloud API direto no futuro = trocar ~200 linhas, sem tocar no resto.

---

## 🧩 Modelo de dados

### Tabela `campaign`
| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid v7 | PK |
| `restaurant_id` | uuid | FK |
| `account_id` | uuid | FK (RLS) |
| `name` | varchar | Nome interno da campanha |
| `segment_name` | text | Segmento-alvo (`champions`/`new`/`at_risk`/`inactive`) |
| `template_name` | varchar | Template HSM aprovado |
| `template_params` | jsonb | Variáveis do template (ex.: `{nome}`) |
| `status` | enum | `draft`/`sending`/`sent`/`failed` |
| `attribution_window_days` | int | Default 7 (para o ROI do S5) |
| `total_targets` | int | Snapshot da contagem ao disparar |
| `created_at` / `sent_at` | timestamptz | |

### Tabela `campaign_target` (snapshot imutável — coração do ROI)
| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid v7 | PK |
| `campaign_id` | uuid | FK |
| `restaurant_id` / `account_id` | uuid | FK (RLS) |
| `customer_id` | uuid | FK |
| `phone_snapshot` | varchar | Telefone **congelado** no disparo (E.164) |
| `name_snapshot` | varchar | Nome congelado |
| `segment_snapshot` | text | Segmento congelado |
| `created_at` | timestamptz | |

> **Crítico:** o target congela o cliente no momento do disparo. Garante ROI auditável mesmo que o cliente mude de segmento depois.

### Tabela `message_log`
| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid v7 | PK |
| `campaign_target_id` | uuid | FK |
| `restaurant_id` / `account_id` | uuid | FK (RLS) |
| `provider_message_id` | varchar | ID retornado pelo Twilio |
| `status` | enum | `queued`/`sent`/`delivered`/`read`/`failed` |
| `error_code` | varchar | Código de erro do provedor (se falhou) |
| `category` | varchar | `marketing`/`utility` (para custo) |
| `sent_at` / `delivered_at` / `read_at` | timestamptz | |

Todas as tabelas: `FORCE ROW LEVEL SECURITY` + `WITH CHECK`.

---

## 🧠 Módulo `messaging` (isolamento do provedor)

```
WhatsAppProvider (interface)
  ├─ sendTemplate(to, templateName, params): Promise<{ providerMessageId }>
  └─ TwilioWhatsAppAdapter (implementação — única que conhece o Twilio)
```

Toda a lógica de negócio fala com a **interface**, nunca com o Twilio diretamente. Flag de ambiente `WHATSAPP_PROVIDER=twilio|mock`.

---

## ⚙️ Módulo `campaigns`

- **Criar** campanha (status `draft`)
- **Editar** (somente enquanto `draft`)
- **Preview** (renderiza template com variáveis para um cliente exemplo)
- **Dispatch** com `Idempotency-Key` (UUID v4 gerado no front) — snapshot dos targets em batch, enfileira na fila `campaign.dispatch`
- Estimativa de duração ao usuário (baseada no rate limit)

### Fila `campaign.dispatch` (rate-limited)
- Token bucket por `restaurant_id` no Redis
- Rampa de tier (respeitar limites Meta: 1K → 10K → 100K)
- Jitter entre envios
- **Checagem de opt-in obrigatória antes de cada envio** — cliente sem `consent_whatsapp` não recebe
- Cada envio → cria `message_log`

### Fila `message.status`
- `POST /webhooks/twilio/status` (`@SkipAuth` + validação de assinatura Twilio)
- Atualiza `message_log.status` (sent/delivered/read/failed)

---

## 🔑 Regras de WhatsApp (não negociáveis)

1. **Opt-in obrigatório** — cliente sem `consent_whatsapp = true` nunca recebe. Campo já modelado.
2. **Templates aprovados** — só dispara com template HSM aprovado pela Meta.
3. **Janela de 24h** — fora dela, só template pago (categoria Marketing).
4. **Categoria importa para custo** — registrar `marketing`/`utility` no `message_log` para o ROI do S5.
5. **Rate limit respeitando tiers da Meta** — não é anti-ban, é conformidade com a quality rating.

---

## 🔴 Regras críticas de tenant

- `WHERE account_id = :aid AND restaurant_id = :rid` explícito em toda query
- `FORCE RLS` + `WITH CHECK` nas 3 tabelas novas
- Dispatch roda em `runInTenantContext(accountId)` no worker
- `RestaurantAccessGuard` em todos os endpoints (lição do S3: validar cross-tenant retorna 403)
- Snapshot de targets nunca cruza restaurantes

---

## 🖥️ Frontend (telas já esboçadas — integrar)

- **Nova Campanha** (`_app.campanhas.nova`) — wizard: escolher segmento → escrever/escolher template → preview → confirmar
- **Lista** (`_app.campanhas.index`)
- **Detalhe** (`_app.campanhas.$campaignId`) — funil ao vivo (enviados → entregues → lidos)
- Wizard consome segmentos reais (do S3) e templates aprovados
- Front gera `Idempotency-Key` (UUID v4)
- Estado "sending" via **polling 5s** (sem WebSocket)
- Aviso visível de opt-in/template não aprovado

---

## 🧪 Critério de aceite (QA — você)

| # | Teste | Passou? |
|---|---|---|
| 1 | Criar campanha em `draft`, editar, e ela só edita enquanto draft | ☐ |
| 2 | Dispatch de 100 mensagens respeita o rate limit (não estoura) | ☐ |
| 3 | Mesma `Idempotency-Key` não re-dispara a campanha | ☐ |
| 4 | Cliente sem `consent_whatsapp` **não** recebe | ☐ |
| 5 | `campaign_target` congela phone/nome/segmento no disparo | ☐ |
| 6 | Status atualiza no front via polling (sent → delivered) | ☐ |
| 7 | **Mensagem real chega num número de teste** (sandbox Twilio + template) | ☐ |
| 8 | Isolamento de tenant: campanha de outro tenant retorna 403 | ☐ |
| 9 | `message_log` registra categoria (marketing/utility) | ☐ |
| 10 | Trocar `WHATSAPP_PROVIDER=mock` desativa Twilio sem quebrar o fluxo | ☐ |

**Resultado:** ☐ PASSOU → Sprint 5 · ☐ Defeitos → correção antes de avançar

---

## 🚫 Fora de escopo (MVP)

- Automações (reativação automática, aniversário, boas-vindas)
- Cupons na campanha
- Multicanal (SMS, e-mail, push)
- A/B testing de mensagens
- Migração para Cloud API direto (futuro — adapter já prepara)

---

## 📋 Pré-requisitos de negócio (correm em paralelo ao dev)

| # | Item | Status | Responsável |
|---|---|---|---|
| 1 | Conta Twilio + WhatsApp Sandbox ativado | ⬜ | Você |
| 2 | Verificação Meta Business iniciada | ⬜ | Você |
| 3 | Ao menos 1 template HSM submetido/aprovado | ⬜ | Você |
| 4 | Número de teste para receber a mensagem | ⬜ | Você |
| 5 | Política de opt-in definida (como/quando coletar consent) | ⬜ | Você + Murilo |
