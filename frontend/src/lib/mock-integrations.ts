export type ProviderId = "anota-ai" | "cardapio-web" | "saipos" | "ifood";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "active"
  | "syncing"
  | "error";

export type Provider = {
  id: ProviderId;
  nome: string;
  descricao: string;
  available: boolean;
  color: string; // tailwind bg class for logo tile
  helper: string;
};

export type Connection = {
  status: ConnectionStatus;
  lastSyncMinutesAgo?: number;
  customers?: number;
  orders?: number;
  error?: string;
  progress?: number;
};

export const PROVIDERS: Provider[] = [
  {
    id: "anota-ai",
    nome: "Anota AI",
    descricao: "Pedidos via WhatsApp e atendentes virtuais.",
    available: true,
    color: "bg-rose-500",
    helper:
      "Acesse o painel Anota AI → Configurações → Integrações → API e copie o token gerado.",
  },
  {
    id: "cardapio-web",
    nome: "Cardápio Web",
    descricao: "Cardápio digital e link de pedidos.",
    available: true,
    color: "bg-indigo-500",
    helper:
      "No Cardápio Web, vá em Minha conta → API → Gerar novo token e cole aqui.",
  },
  {
    id: "saipos",
    nome: "Saipos",
    descricao: "Sistema de gestão para restaurantes.",
    available: false,
    color: "bg-amber-500",
    helper: "",
  },
  {
    id: "ifood",
    nome: "iFood",
    descricao: "Pedidos vindos do marketplace iFood.",
    available: false,
    color: "bg-zinc-800",
    helper: "",
  },
];

export const INITIAL_CONNECTIONS: Record<ProviderId, Connection> = {
  "anota-ai": {
    status: "active",
    lastSyncMinutesAgo: 4,
    customers: 1240,
    orders: 8300,
  },
  "cardapio-web": { status: "disconnected" },
  saipos: { status: "disconnected" },
  ifood: { status: "disconnected" },
};

// 24h ingestion mocked — peaks at lunch and dinner
export const INGESTION_24H: { hour: string; orders: number }[] = [
  { hour: "00:00", orders: 2 },
  { hour: "01:00", orders: 1 },
  { hour: "02:00", orders: 0 },
  { hour: "03:00", orders: 0 },
  { hour: "04:00", orders: 0 },
  { hour: "05:00", orders: 1 },
  { hour: "06:00", orders: 3 },
  { hour: "07:00", orders: 6 },
  { hour: "08:00", orders: 10 },
  { hour: "09:00", orders: 12 },
  { hour: "10:00", orders: 14 },
  { hour: "11:00", orders: 22 },
  { hour: "12:00", orders: 38 },
  { hour: "13:00", orders: 42 },
  { hour: "14:00", orders: 24 },
  { hour: "15:00", orders: 11 },
  { hour: "16:00", orders: 9 },
  { hour: "17:00", orders: 14 },
  { hour: "18:00", orders: 26 },
  { hour: "19:00", orders: 41 },
  { hour: "20:00", orders: 45 },
  { hour: "21:00", orders: 36 },
  { hour: "22:00", orders: 20 },
  { hour: "23:00", orders: 8 },
];

export function getProvider(id: ProviderId): Provider {
  return PROVIDERS.find((p) => p.id === id)!;
}

export function formatLastSync(min: number): string {
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

export function formatBR(n: number): string {
  return n.toLocaleString("pt-BR");
}
