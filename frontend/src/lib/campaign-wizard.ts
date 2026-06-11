export type WizardStep = 1 | 2 | 3;
export type SendOption = "now" | "scheduled";

export type SegmentOption = {
  id: "campeoes" | "novos" | "em-risco" | "inativos";
  nome: string;
  count: number;
  optOut: number;
  description: string;
};

export const SEGMENTS: SegmentOption[] = [
  {
    id: "campeoes",
    nome: "Campeões",
    count: 89,
    optOut: 2,
    description: "Pedem com frequência e gastam mais",
  },
  {
    id: "novos",
    nome: "Novos",
    count: 156,
    optOut: 5,
    description: "Primeira compra nos últimos 30 dias",
  },
  {
    id: "em-risco",
    nome: "Em Risco",
    count: 342,
    optOut: 8,
    description: "Reduziram a frequência recentemente",
  },
  {
    id: "inativos",
    nome: "Inativos",
    count: 653,
    optOut: 12,
    description: "Não pedem há mais de 60 dias",
  },
];

export type Template = { id: string; nome: string; body: string };

export const TEMPLATES: Template[] = [
  {
    id: "desconto",
    nome: "Reativação com desconto",
    body:
      "Oi {nome}! Sentimos sua falta na {restaurante} 💛 Use o cupom VOLTA15 e ganhe 15% no seu próximo pedido. Válido até domingo!",
  },
  {
    id: "saudade",
    nome: "Sentimos sua falta",
    body:
      "Oi {nome}, faz um tempo que você não pede na {restaurante}. Que tal aquele combo que você ama hoje no jantar?",
  },
  {
    id: "oferta",
    nome: "Oferta do dia",
    body:
      "Oi {nome}! Hoje na {restaurante} tem combo da casa com sobremesa grátis. Bora aproveitar?",
  },
];

export const SAMPLE_VARS = { nome: "Maria", restaurante: "Cantina da Nona" };

export function renderPreview(text: string, vars = SAMPLE_VARS) {
  return text
    .replace(/\{nome\}/g, vars.nome)
    .replace(/\{restaurante\}/g, vars.restaurante);
}

export function estimateMinutes(count: number) {
  return Math.max(5, Math.round(count / 15));
}

export type WizardState = {
  segmentoId: SegmentOption["id"] | null;
  mensagem: string;
  janelaDias: number;
  sendOption: SendOption;
  scheduledAt: Date | null;
};

export const INITIAL_STATE: WizardState = {
  segmentoId: null,
  mensagem: "",
  janelaDias: 7,
  sendOption: "now",
  scheduledAt: null,
};

export function getSegment(id: SegmentOption["id"] | null) {
  return SEGMENTS.find((s) => s.id === id) ?? null;
}
