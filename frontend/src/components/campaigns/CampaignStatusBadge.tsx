import { cn } from "@/lib/utils";
import type { CampaignStatus } from "@/lib/api/campaigns";

const config: Record<
  CampaignStatus,
  { label: string; classes: string; dot: string; pulse?: boolean }
> = {
  draft: {
    label: "Rascunho",
    classes: "bg-zinc-100 text-zinc-700 border-zinc-200",
    dot: "bg-zinc-400",
  },
  scheduled: {
    label: "Agendada",
    classes: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  sending: {
    label: "Enviando",
    classes: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    pulse: true,
  },
  sent: {
    label: "Enviada",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  failed: {
    label: "Falhou",
    classes: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        c.classes,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot, c.pulse && "animate-pulse")} />
      {c.label}
    </span>
  );
}
