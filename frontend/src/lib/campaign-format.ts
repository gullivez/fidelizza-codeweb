export const SEGMENT_LABELS: Record<string, string> = {
  champions: "Campeões",
  new: "Novos",
  at_risk: "Em Risco",
  inactive: "Inativos",
};

export function formatShortDate(iso: string) {
  const [, month = "01", day = "01"] = iso.match(/^(\d{4})-(\d{2})-(\d{2})/) ?? [];
  const months = [
    "jan.",
    "fev.",
    "mar.",
    "abr.",
    "mai.",
    "jun.",
    "jul.",
    "ago.",
    "set.",
    "out.",
    "nov.",
    "dez.",
  ];
  return `${Number(day).toString().padStart(2, "0")} de ${months[Number(month) - 1] ?? "jan."}`;
}

export function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
