import type { Period } from "@/lib/mock-dashboard";

export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "failed";

export type Campaign = {
  id: string;
  nome: string;
  segmentoAlvo: string;
  status: CampaignStatus;
  enviados: number;
  total: number; // target audience size
  entregues: number;
  conversoes: number;
  receita: number;
  data: string; // ISO
};

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "c-001",
    nome: "Reativação Inativos Outubro",
    segmentoAlvo: "Inativos",
    status: "sent",
    enviados: 653,
    total: 653,
    entregues: 638,
    conversoes: 84,
    receita: 6420,
    data: "2026-05-28",
  },
  {
    id: "c-002",
    nome: "Sentimos sua falta",
    segmentoAlvo: "Em Risco",
    status: "sent",
    enviados: 342,
    total: 342,
    entregues: 331,
    conversoes: 47,
    receita: 3380,
    data: "2026-05-22",
  },
  {
    id: "c-003",
    nome: "Oferta de quinta",
    segmentoAlvo: "Todos",
    status: "sending",
    enviados: 182,
    total: 342,
    entregues: 174,
    conversoes: 18,
    receita: 1240,
    data: "2026-06-09",
  },
  {
    id: "c-004",
    nome: "Aniversariantes — Novembro",
    segmentoAlvo: "Aniversariantes",
    status: "scheduled",
    enviados: 0,
    total: 89,
    entregues: 0,
    conversoes: 0,
    receita: 0,
    data: "2026-06-15",
  },
  {
    id: "c-005",
    nome: "Campeões VIP — Combo",
    segmentoAlvo: "Campeões",
    status: "sent",
    enviados: 89,
    total: 89,
    entregues: 89,
    conversoes: 31,
    receita: 2890,
    data: "2026-05-18",
  },
  {
    id: "c-006",
    nome: "Recuperação 30 dias",
    segmentoAlvo: "Em Risco",
    status: "draft",
    enviados: 0,
    total: 342,
    entregues: 0,
    conversoes: 0,
    receita: 0,
    data: "2026-06-08",
  },
  {
    id: "c-007",
    nome: "Black Friday Delivery",
    segmentoAlvo: "Todos",
    status: "sent",
    enviados: 1240,
    total: 1240,
    entregues: 1198,
    conversoes: 156,
    receita: 14820,
    data: "2026-05-10",
  },
  {
    id: "c-008",
    nome: "Volta às aulas",
    segmentoAlvo: "Novos",
    status: "failed",
    enviados: 0,
    total: 156,
    entregues: 0,
    conversoes: 0,
    receita: 0,
    data: "2026-05-05",
  },
  {
    id: "c-009",
    nome: "Combo família — fim de semana",
    segmentoAlvo: "Todos",
    status: "sent",
    enviados: 1240,
    total: 1240,
    entregues: 1212,
    conversoes: 98,
    receita: 9870,
    data: "2026-04-27",
  },
  {
    id: "c-010",
    nome: "Cupom de retorno",
    segmentoAlvo: "Inativos",
    status: "sent",
    enviados: 653,
    total: 653,
    entregues: 622,
    conversoes: 52,
    receita: 4120,
    data: "2026-04-12",
  },
];

export type StatusFilter = CampaignStatus | "all";

export function filterCampaigns(
  list: Campaign[],
  opts: { status?: StatusFilter; periodo?: Period },
): Campaign[] {
  const { status = "all", periodo = "30d" } = opts;
  const days = periodo === "7d" ? 7 : periodo === "90d" ? 90 : 30;
  const cutoff = new Date("2026-06-09T12:00:00Z").getTime() - days * 86400000;
  return list.filter((c) => {
    if (status !== "all" && c.status !== status) return false;
    if (new Date(`${c.data}T12:00:00Z`).getTime() < cutoff) return false;
    return true;
  });
}

export function getCampaignSummary(list: Campaign[]) {
  const total = list.length;
  const receitaTotal = list.reduce((s, c) => s + c.receita, 0);
  const sentList = list.filter((c) => c.enviados > 0);
  const conversaoMedia =
    sentList.length === 0
      ? 0
      : sentList.reduce((s, c) => s + (c.conversoes / Math.max(c.enviados, 1)) * 100, 0) /
        sentList.length;
  return { total, receitaTotal, conversaoMedia };
}

export function formatShortDate(iso: string) {
  const [, month = "01", day = "01"] = iso.match(/^(\d{4})-(\d{2})-(\d{2})/) ?? [];
  const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
  return `${Number(day).toString().padStart(2, "0")} de ${months[Number(month) - 1] ?? "jan."}`;
}
