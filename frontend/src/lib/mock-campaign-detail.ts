import { MOCK_CAMPAIGNS, type Campaign } from "./mock-campaigns";

export type MessageStatus =
  | "enviado"
  | "entregue"
  | "lido"
  | "falha"
  | "convertido";

export type Recipient = {
  id: string;
  nome: string;
  telefone: string;
  messageStatus: MessageStatus;
  valorPedido?: number;
};

export type CampaignDetail = Campaign & {
  mensagem: string;
  lidos: number;
  pedidos: number;
  ticketMedio: number;
  falhas: number;
  janelaAtribuicaoFim: string; // ISO
  motivoFalha?: string;
};

export type DerivedStatus = "sending" | "sent-pending" | "completed" | "failed";

const NOW = new Date("2026-06-09T12:00:00").getTime();

function daysFromNow(n: number) {
  return new Date(NOW + n * 86400000).toISOString();
}

const DEFAULTS: Record<string, Partial<CampaignDetail>> = {
  "c-001": {
    mensagem:
      "Oi {nome}! Sentimos sua falta na Cantina da Nona 💛 Use o cupom VOLTA15 e ganhe 15% no seu próximo pedido. Válido até domingo!",
    lidos: 489,
    pedidos: 84,
    ticketMedio: 76,
    falhas: 15,
    janelaAtribuicaoFim: daysFromNow(-5),
  },
  "c-002": {
    mensagem:
      "Oi {nome}, faz um tempo que você não pede na Cantina da Nona. Que tal aquele combo que você ama hoje no jantar?",
    lidos: 248,
    pedidos: 47,
    ticketMedio: 72,
    falhas: 11,
    janelaAtribuicaoFim: daysFromNow(5), // open → sent-pending
  },
  "c-003": {
    mensagem:
      "Oi {nome}! Hoje na Cantina da Nona tem combo da casa com sobremesa grátis. Bora aproveitar?",
    lidos: 120,
    pedidos: 18,
    ticketMedio: 69,
    falhas: 8,
    janelaAtribuicaoFim: daysFromNow(7),
  },
  "c-005": {
    mensagem:
      "Olá {nome}! Como cliente VIP da Cantina da Nona, separamos um combo exclusivo para você hoje. Confira no link 🍝",
    lidos: 78,
    pedidos: 31,
    ticketMedio: 93,
    falhas: 0,
    janelaAtribuicaoFim: daysFromNow(-15),
  },
  "c-007": {
    mensagem:
      "Black Friday Delivery na Cantina! Combos com até 30% off só hoje, {nome}. Aproveite!",
    lidos: 942,
    pedidos: 156,
    ticketMedio: 95,
    falhas: 42,
    janelaAtribuicaoFim: daysFromNow(-23),
  },
  "c-008": {
    mensagem:
      "Volta às aulas com a Cantina, {nome}! Marmita do estudante com 20% off.",
    lidos: 0,
    pedidos: 0,
    ticketMedio: 0,
    falhas: 156,
    janelaAtribuicaoFim: daysFromNow(-30),
    motivoFalha: "WhatsApp desconectado durante o envio",
  },
  "c-009": {
    mensagem:
      "Fim de semana pede combo família na Cantina, {nome}! Pizza + refri por R$ 89.",
    lidos: 856,
    pedidos: 98,
    ticketMedio: 101,
    falhas: 28,
    janelaAtribuicaoFim: daysFromNow(-38),
  },
  "c-010": {
    mensagem:
      "Oi {nome}, voltou! Use RETORNO20 e ganhe R$ 20 no próximo pedido na Cantina.",
    lidos: 412,
    pedidos: 52,
    ticketMedio: 79,
    falhas: 31,
    janelaAtribuicaoFim: daysFromNow(-53),
  },
};

export function getCampaignDetail(id: string): CampaignDetail | null {
  const base = MOCK_CAMPAIGNS.find((c) => c.id === id);
  if (!base) return null;
  const extra = DEFAULTS[id] ?? {
    mensagem: "Mensagem da campanha não disponível.",
    lidos: 0,
    pedidos: base.conversoes,
    ticketMedio: base.conversoes ? Math.round(base.receita / base.conversoes) : 0,
    falhas: 0,
    janelaAtribuicaoFim: daysFromNow(-1),
  };
  return { ...base, ...(extra as CampaignDetail) };
}

export function getDerivedStatus(c: CampaignDetail): DerivedStatus {
  if (c.status === "failed") return "failed";
  if (c.status === "sending") return "sending";
  if (c.status === "sent") {
    const open = new Date(c.janelaAtribuicaoFim).getTime() > NOW;
    return open ? "sent-pending" : "completed";
  }
  return "completed";
}

export type FunnelStep = {
  key: string;
  label: string;
  value: number;
  display: string;
  pctNext?: number;
  highlight?: boolean;
};

export function funnelSteps(c: CampaignDetail): FunnelStep[] {
  const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);
  return [
    { key: "alvos", label: "Alvos", value: c.total, display: format(c.total), pctNext: pct(c.enviados, c.total) },
    { key: "enviados", label: "Enviados", value: c.enviados, display: format(c.enviados), pctNext: pct(c.entregues, c.enviados) },
    { key: "entregues", label: "Entregues", value: c.entregues, display: format(c.entregues), pctNext: pct(c.lidos, c.entregues) },
    { key: "lidos", label: "Lidos", value: c.lidos, display: format(c.lidos), pctNext: pct(c.pedidos, c.lidos) },
    { key: "pedidos", label: "Pedidos", value: c.pedidos, display: format(c.pedidos) },
    { key: "receita", label: "Receita", value: c.receita, display: formatBRL(c.receita), highlight: true },
  ];
}

export type CampaignKpis = {
  taxaEntrega: number;
  taxaLeitura: number;
  taxaConversao: number;
  receita: number;
  ticketMedio: number;
};

export function getKpis(c: CampaignDetail): CampaignKpis {
  return {
    taxaEntrega: c.enviados ? (c.entregues / c.enviados) * 100 : 0,
    taxaLeitura: c.entregues ? (c.lidos / c.entregues) * 100 : 0,
    taxaConversao: c.enviados ? (c.pedidos / c.enviados) * 100 : 0,
    receita: c.receita,
    ticketMedio: c.ticketMedio,
  };
}

// --- Recipients ---

const FIRST_NAMES = [
  "Maria", "João", "Ana", "Pedro", "Carla", "Lucas", "Beatriz", "Rafael",
  "Juliana", "Bruno", "Fernanda", "Tiago", "Camila", "Diego", "Larissa",
  "Marcos", "Patrícia", "Rodrigo", "Aline", "Felipe", "Vanessa", "Gabriel",
  "Renata", "Vinícius", "Tatiana",
];
const LAST_NAMES = [
  "Silva", "Souza", "Oliveira", "Costa", "Pereira", "Almeida", "Lima",
  "Carvalho", "Ribeiro", "Gomes", "Martins", "Araújo", "Barbosa", "Rocha",
  "Dias", "Cardoso", "Nascimento", "Moreira", "Teixeira", "Cavalcanti",
  "Mendes", "Freitas", "Ramos", "Pinto", "Andrade",
];

function phone(i: number) {
  const base = 980000000 + i * 13241;
  const s = String(base).slice(0, 9);
  return `+55 11 9${s.slice(1, 5)}-${s.slice(5, 9)}`;
}

export function getRecipients(c: CampaignDetail): Recipient[] {
  const N = 25;
  const list: Recipient[] = [];
  const convertedRatio = c.enviados ? c.pedidos / c.enviados : 0;
  const readRatio = c.enviados ? c.lidos / c.enviados : 0;
  const deliveredRatio = c.enviados ? c.entregues / c.enviados : 0;
  const failRatio = c.enviados ? c.falhas / c.enviados : 0;

  for (let i = 0; i < N; i++) {
    const seed = i / N;
    let status: MessageStatus;
    let valorPedido: number | undefined;
    if (c.status === "failed") {
      status = "falha";
    } else if (c.status === "sending" && i >= Math.floor(N * (c.enviados / c.total))) {
      // not yet sent in mock — show as enviado pending? We'll skip and mark enviado
      status = "enviado";
    } else if (seed < convertedRatio) {
      status = "convertido";
      valorPedido = Math.round(c.ticketMedio * (0.7 + (i % 5) * 0.15));
    } else if (seed < readRatio) {
      status = "lido";
    } else if (seed < deliveredRatio) {
      status = "entregue";
    } else if (seed < deliveredRatio + failRatio) {
      status = "falha";
    } else {
      status = "enviado";
    }

    list.push({
      id: `${c.id}-r${i}`,
      nome: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 3) % LAST_NAMES.length]}`,
      telefone: phone(i),
      messageStatus: status,
      valorPedido,
    });
  }
  return list;
}

// --- Formatters (re-exports for convenience) ---

function format(n: number) {
  return n.toLocaleString("pt-BR");
}
function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDayMonth(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}
