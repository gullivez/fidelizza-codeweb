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

/** Sempre em horário de Brasília, independente do fuso da máquina do usuário. */
export function formatDateTime(iso: string) {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });
  const timePart = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
  return `${datePart} às ${timePart}`;
}

/** dd/MM/yyyy HH:mm em horário de Brasília. */
export function formatDateTimeShort(iso: string) {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
  const timePart = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
  return `${datePart} ${timePart}`;
}
