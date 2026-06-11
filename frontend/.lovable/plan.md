# Tela Configurações

Substituir o stub de `/configuracoes` por uma página com sub-navegação lateral (estilo Linear/Stripe) e 5 abas. A aba ativa é controlada por search param `?tab=` (deep-link) e o componente é client-side; a página inteira fica dentro do `AppLayout` já existente.

## Arquivo novo `src/lib/mock-settings.ts`

Tipos e mocks consumidos só pela página:

```ts
type Role = 'owner' | 'admin' | 'operator';
type AccountType = 'single' | 'agency';
type BillingStatus = 'active' | 'past_due' | 'canceled';

CURRENT_USER = { role: 'owner', accountType: 'agency' };

ACCOUNT = {
  empresa: 'Burger House Brasil Ltda',
  cnpj: '12.345.678/0001-90',
  plano: 'Pro',
  billingStatus: 'active',
  limites: { whatsappNumeros: 3, restaurantes: 5 },
  uso:     { whatsappNumeros: 1, restaurantes: 3 },
};

WHATSAPP = { connected: true, numero: '+55 11 98765-4321', health: 'healthy' };
// health: 'healthy' | 'warming' | 'disconnected'

USERS = [4 mocks: Ana (owner), Bruno (admin), Carla (operator) ativa,
         Diego (operator) pendente];

RESTAURANTS = [3 mocks: Burger House Vila Madá / Pinheiros / Moema,
               com whatsapp connected boolean + customers count + status];

PREFS = { timezone: 'America/Sao_Paulo', restaurantName: 'Burger House' };
```

Helpers: `formatBR(n)`, lista de timezones BR (`America/Sao_Paulo`, `America/Recife`, `America/Manaus`).

Override demo via search params: `?role=operator` força operator; `?wa=off` força WhatsApp desconectado e sincroniza com o `LayoutContext.setWhatsappConnected(false)` num `useEffect`; `?billing=past_due` força status.

## Arquivo editado `src/routes/_app.configuracoes.tsx`

- `validateSearch` com zod: `{ tab?: 'whatsapp'|'conta'|'usuarios'|'restaurantes'|'preferencias', role?, wa?, billing? }`.
- Componente lê `Route.useSearch()` + `Route.useNavigate()` para trocar de aba (`navigate({ search: { tab } })`).
- Filtra abas conforme `role`: `operator` não vê **Conta** nem **Restaurantes**; tab padrão para operator vira `whatsapp`.
- Layout interno: `PageHeader` "Configurações" / "Preferências da conta e do restaurante" no topo; abaixo grid `md:grid-cols-[200px_1fr] gap-8`:
  - Coluna esquerda: `<nav>` com `SettingsNav` (lista vertical de botões).
  - Coluna direita: `<SettingsPanel>` renderizando o conteúdo da aba.
- Em mobile (`<md`): nav vira `Tabs` horizontais com scroll.

## Componentes novos em `src/components/settings/`

### `SettingsNav.tsx`
Lista vertical com ícones + label. Item ativo: `bg-zinc-100 text-foreground font-medium`, inativos `text-muted-foreground hover:bg-zinc-50`. Item WhatsApp ganha um ponto vermelho à direita se desconectado (sinal visual de prioridade).

### `WhatsAppPanel.tsx`
- Card grande no topo: `StatusBadge` grande (variant success "Conectado" ou danger "Desconectado") + número formatado em `text-2xl font-semibold`.
- Linha de saúde: ícone + texto "Número saudável" (emerald) / "Em aquecimento" (amber) / "Desconectado" (rose).
- Se desconectado: bloco com QR Code (placeholder SVG quadrado 192×192 com pattern) + instruções numeradas curtas: 1) Abra o WhatsApp 2) Aparelhos conectados 3) Escaneie o QR. Botão "Já escaneei" (mock toggla conectado).
- Nota cinza ao final: "Este é o número usado para enviar suas campanhas. Se ele cair, as campanhas são pausadas automaticamente."
- Botão "Desconectar" secundário quando conectado.
- Ao alterar conexão local, propaga para `useLayout().setWhatsappConnected(...)` — assim o banner global do shell reflete em tempo real.

### `ContaPanel.tsx`
- Bloco "Dados da empresa": form com `Nome da empresa`, `CNPJ`, botão "Salvar" (loading state simulado por 800ms → toast).
- Bloco "Plano & Assinatura":
  - Header: "Plano **Pro**" + `StatusBadge` (success "Ativo" / warning "Pagamento pendente" / neutral "Cancelado").
  - Se `past_due`: banner amber não-bloqueante acima do conteúdo do bloco com texto "Pagamento pendente. Regularize para evitar suspensão." + link "Atualizar pagamento".
  - Grid 2 colunas com limites: "Números de WhatsApp 1/3" e "Restaurantes 3/5" — cada um com `Progress` indigo.
  - Botão `outline` "Gerenciar assinatura".

### `UsuariosPanel.tsx`
- Header da seção com título + botão primário "Convidar usuário" (abre dialog mock com input email + select de papel + botão Enviar — só visual).
- Tabela `DataTable` (reaproveita `src/components/common/DataTable.tsx`): colunas Nome, Email, Papel (badge cor por papel — owner=indigo, admin=emerald, operator=zinc), Status (`StatusBadge` Ativo/Pendente), Ações (dropdown `MoreHorizontal` com "Editar papel" / "Remover" mock).
- Se `accountType === 'agency'`: bloco extra abaixo "Acesso a restaurantes" — matriz com usuários nas linhas e restaurantes nas colunas, usando `Checkbox`. Estado local. Owner sempre tem todos os checks bloqueados e marcados.

### `RestaurantesPanel.tsx`
- Tabela `DataTable`: Nome, Status (ativo/arquivado), Nº de clientes (tabular-nums), "WhatsApp conectado?" (✓ emerald / ✗ zinc), Ações (dropdown: "Editar" / "Arquivar").
- Botão primário "Adicionar restaurante" (abre dialog mock com nome + endereço).
- Arquivamento move localmente para status='arquivado' e fica acinzentado.

### `PreferenciasPanel.tsx`
- Form simples: `Select` fuso horário (3 opções BR), `Input` "Nome do restaurante usado em {restaurante}" com helper text "Aparece nas mensagens das campanhas no lugar da variável `{restaurante}`."
- Botão "Salvar preferências" com estado loading.

## Permissões / estados

- Lista de tabs construída a partir de `CURRENT_USER.role`: operator filtra `conta` e `restaurantes`. Se o usuário acessa `?tab=conta` sendo operator, redireciona para `whatsapp` via `useEffect` + `navigate({ search: { tab: 'whatsapp' } })`.
- `RestaurantesPanel` também só aparece se `accountType === 'agency'` (independente de role).
- Cada form usa `useState` para `saving` e simula latência com `setTimeout(800)`; sucesso dispara `toast.success` (sonner já configurado).
- WhatsApp desconectado: o banner global existente (`WhatsAppAlertBanner`) já lê do `LayoutContext`. Sincronizamos local state ↔ contexto.

## Fora do escopo

- Backend / persistência real.
- QR Code real (placeholder SVG).
- Convite real por email — apenas dialog visual.
- Mudança real de plano.
