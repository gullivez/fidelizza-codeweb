export const SEGMENT_LABELS: Record<string, string> = {
  champions: "Campeões",
  new: "Novos",
  at_risk: "Em Risco",
  inactive: "Inativos",
};

export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
