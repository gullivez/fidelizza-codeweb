export type Period = "7d" | "30d" | "90d";

export type RevenuePoint = { date: string; value: number };

export type DashboardData = {
  kpis: {
    revenue: number;
    revenueDelta: number; // percent
    conversion: number; // percent
    reactivated: number;
    campaignsSent: number;
  };
  revenueSeries: RevenuePoint[];
  rfm: {
    champions: number;
    new: number;
    atRisk: number;
    inactive: number;
  };
  lastCampaign: {
    name: string;
    sent: number;
    delivered: number;
    read: number;
    orders: number;
    revenue: number;
  };
  opportunities: Opportunity[];
};

export type Opportunity = {
  id: string;
  segment: string;
  customers: number;
  description: string;
};

function fmtDate(d: Date) {
  return d.toISOString().slice(5, 10); // MM-DD
}

function buildSeries(days: number, base: number, amp: number, trend: number): RevenuePoint[] {
  const out: RevenuePoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const noise = Math.sin(i * 1.7) * amp + Math.cos(i * 0.6) * amp * 0.5;
    const value = Math.max(0, Math.round(base + noise + (days - i) * trend));
    out.push({ date: fmtDate(d), value });
  }
  return out;
}

export const opportunities: Opportunity[] = [
  {
    id: "o1",
    segment: "Inativos 30+ dias",
    customers: 312,
    description: "Não compram há mais de 30 dias — alto potencial de reativação",
  },
  {
    id: "o2",
    segment: "Em risco (14d sem pedir)",
    customers: 184,
    description: "Frequentes que pararam de pedir nas últimas 2 semanas",
  },
  {
    id: "o3",
    segment: "Aniversariantes da semana",
    customers: 12,
    description: "Clientes fazem aniversário nos próximos 7 dias",
  },
  {
    id: "o4",
    segment: "Champions sem pedir há 21d",
    customers: 28,
    description: "Top clientes que estão demorando para voltar",
  },
];

export const dashboardByPeriod: Record<Period, DashboardData> = {
  "7d": {
    kpis: {
      revenue: 1120,
      revenueDelta: 9,
      conversion: 11.2,
      reactivated: 9,
      campaignsSent: 2,
    },
    revenueSeries: buildSeries(7, 140, 40, 6),
    rfm: { champions: 128, new: 96, atRisk: 184, inactive: 312 },
    lastCampaign: {
      name: "Saudade da Cantina",
      sent: 420,
      delivered: 412,
      read: 287,
      orders: 38,
      revenue: 1840,
    },
    opportunities,
  },
  "30d": {
    kpis: {
      revenue: 4280,
      revenueDelta: 18,
      conversion: 12.4,
      reactivated: 34,
      campaignsSent: 6,
    },
    revenueSeries: buildSeries(30, 110, 35, 3),
    rfm: { champions: 128, new: 96, atRisk: 184, inactive: 312 },
    lastCampaign: {
      name: "Saudade da Cantina",
      sent: 420,
      delivered: 412,
      read: 287,
      orders: 38,
      revenue: 1840,
    },
    opportunities,
  },
  "90d": {
    kpis: {
      revenue: 12640,
      revenueDelta: 27,
      conversion: 13.1,
      reactivated: 112,
      campaignsSent: 18,
    },
    revenueSeries: buildSeries(90, 90, 30, 1.4),
    rfm: { champions: 142, new: 108, atRisk: 196, inactive: 298 },
    lastCampaign: {
      name: "Saudade da Cantina",
      sent: 420,
      delivered: 412,
      read: 287,
      orders: 38,
      revenue: 1840,
    },
    opportunities,
  },
};

export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumber(value: number) {
  return value.toLocaleString("pt-BR");
}
