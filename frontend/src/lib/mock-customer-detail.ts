import { mockCustomers, segmentLabels, type Customer } from "./mock-customers";

export type CustomerDetail = Customer & {
  email: string;
  birthday: string; // ISO
  source: "iFood" | "Anota AI" | "Cardápio Web";
  createdAt: string; // ISO
};

export type RFMScore = { r: number; f: number; m: number };

export type TimelineEvent =
  | { id: string; type: "order"; date: string; title: string; subtitle: string }
  | { id: string; type: "message"; date: string; title: string; subtitle: string }
  | { id: string; type: "conversion"; date: string; title: string; subtitle: string; amount: number }
  | { id: string; type: "segment"; date: string; title: string; subtitle: string }
  | { id: string; type: "signup"; date: string; title: string; subtitle: string };

const today = new Date();
function daysAgo(d: number) {
  const x = new Date(today);
  x.setDate(today.getDate() - d);
  return x.toISOString();
}

const sources: CustomerDetail["source"][] = ["iFood", "Anota AI", "Cardápio Web"];

function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function slugEmail(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z\s]/g, "")
      .trim()
      .replace(/\s+/g, ".") + "@email.com"
  );
}

export function getCustomerDetail(id: string): CustomerDetail | null {
  const base = mockCustomers.find((c) => c.id === id);
  if (!base) return null;
  const h = hash(id);
  const daysSinceSignup = 90 + (h % 540); // 3 meses a 2 anos
  const birthMonth = (h % 12) + 1;
  const birthDay = (h % 27) + 1;
  return {
    ...base,
    email: slugEmail(base.name),
    birthday: `1990-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`,
    source: sources[h % sources.length],
    createdAt: daysAgo(daysSinceSignup),
  };
}

export function getCustomerRFM(detail: CustomerDetail): RFMScore {
  switch (detail.segment) {
    case "campeoes":
      return { r: 5, f: 5, m: 5 };
    case "novos":
      return { r: 5, f: 1, m: 2 };
    case "em-risco":
      return { r: 2, f: 3, m: 3 };
    case "inativos":
      return { r: 1, f: 2, m: 3 };
  }
}

export function getCustomerKPIs(detail: CustomerDetail) {
  return {
    totalSpent: detail.totalSpent,
    orders: detail.orders,
    avgTicket: detail.orders ? detail.totalSpent / detail.orders : 0,
    customerSince: detail.createdAt,
    lastOrderAt: detail.lastOrderAt,
  };
}

export function getCustomerTimeline(detail: CustomerDetail): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const h = hash(detail.id);

  // signup
  events.push({
    id: `${detail.id}-signup`,
    type: "signup",
    date: detail.createdAt,
    title: "Cadastro",
    subtitle: `Importado de ${detail.source}`,
  });

  // segment change ~10 dias após cadastro (apenas para clientes com algum histórico)
  if (detail.orders > 0) {
    const segDate = new Date(detail.createdAt);
    segDate.setDate(segDate.getDate() + 14);
    events.push({
      id: `${detail.id}-seg-novos`,
      type: "segment",
      date: segDate.toISOString(),
      title: "Entrou em \"Novos\"",
      subtitle: "Mudança automática de segmento",
    });
  }

  // pedidos distribuídos
  if (detail.orders > 0) {
    const avg = detail.totalSpent / detail.orders;
    const lastOrderDays = Math.max(
      1,
      Math.floor(
        (today.getTime() - new Date(detail.lastOrderAt).getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const oldestDays = Math.min(lastOrderDays + detail.orders * 14 + 5, 360);
    const span = oldestDays - lastOrderDays;
    const step = detail.orders > 1 ? span / (detail.orders - 1) : 0;
    const itemSets = [
      ["Pizza Margherita", "Coca-Cola 2L"],
      ["Combo Burger", "Batata frita", "Milk-shake"],
      ["Yakisoba", "Rolinho primavera"],
      ["Lasanha", "Pudim"],
      ["Sushi Combo 32 peças"],
      ["Esfiha mix", "Suco natural"],
    ];
    for (let i = 0; i < detail.orders; i++) {
      const offset = Math.round(lastOrderDays + step * i);
      const variance = ((h >> i) % 5) - 2; // -2..+2 reais
      const value = Math.max(15, Math.round(avg + variance));
      const items = itemSets[(h + i) % itemSets.length];
      events.push({
        id: `${detail.id}-order-${i}`,
        type: "order",
        date: daysAgo(offset),
        title: `Pedido de ${formatBRL(value)}`,
        subtitle: `${items.length} ${items.length === 1 ? "item" : "itens"} · ${items.join(", ")} · via ${detail.source}`,
      });
    }
  }

  // Campanha + conversão (apenas em segmentos não-Novos com pedidos)
  if (detail.orders > 1 && detail.segment !== "novos") {
    const campaignDate = new Date(detail.lastOrderAt);
    campaignDate.setDate(campaignDate.getDate() - 2);
    events.push({
      id: `${detail.id}-msg-sent`,
      type: "message",
      date: campaignDate.toISOString(),
      title: "Campanha \"Volte e ganhe 15%\"",
      subtitle: detail.optOut ? "Entrega bloqueada (opt-out)" : "Entregue · Lida em 14 min",
    });
    if (!detail.optOut) {
      events.push({
        id: `${detail.id}-conv`,
        type: "conversion",
        date: detail.lastOrderAt,
        amount: Math.round(detail.totalSpent / detail.orders),
        title: `Conversão atribuída · ${formatBRL(Math.round(detail.totalSpent / detail.orders))}`,
        subtitle: "Pedido gerado pela campanha \"Volte e ganhe 15%\"",
      });
    }
  }

  // Segmento atual (último evento de mudança)
  if (detail.segment !== "novos") {
    const segDate = new Date(detail.lastOrderAt);
    segDate.setDate(segDate.getDate() + 1);
    events.push({
      id: `${detail.id}-seg-now`,
      type: "segment",
      date: segDate.toISOString(),
      title: `Entrou em "${segmentLabels[detail.segment]}"`,
      subtitle: "Mudança automática de segmento",
    });
  }

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return events;
}

export function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatPhone(raw: string) {
  // raw: "(11) 98123-4501" → "+55 (11) 98123-4501"
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11) {
    return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return `+55 ${raw}`;
}
