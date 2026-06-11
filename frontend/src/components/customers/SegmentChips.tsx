import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { segmentCounts, segmentLabels, type Segment } from "@/lib/mock-customers";

const segments: { key: Segment; label: string; chip: string }[] = [
  { key: "todos", label: "Todos", chip: "bg-zinc-100 text-zinc-700" },
  { key: "campeoes", label: segmentLabels.campeoes, chip: "bg-emerald-100 text-emerald-700" },
  { key: "novos", label: segmentLabels.novos, chip: "bg-indigo-100 text-indigo-700" },
  { key: "em-risco", label: segmentLabels["em-risco"], chip: "bg-amber-100 text-amber-800" },
  { key: "inativos", label: segmentLabels.inativos, chip: "bg-rose-100 text-rose-700" },
];

function formatCount(n: number) {
  return n.toLocaleString("pt-BR");
}

export function SegmentChips({ active }: { active: Segment }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4 mb-4">
      {segments.map((s) => {
        const isActive = s.key === active;
        return (
          <Link
            key={s.key}
            to="/clientes"
            search={{ segmento: s.key, q: "", page: 1 }}
            className={cn(
              "inline-flex items-center gap-2 h-8 px-3 rounded-full border text-sm transition-colors",
              isActive
                ? "border-foreground bg-card text-foreground"
                : "border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-card",
            )}
          >
            <span className="font-medium">{s.label}</span>
            <span
              className={cn(
                "inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded-full text-[11px] font-semibold tabular-nums",
                s.chip,
              )}
            >
              {formatCount(segmentCounts[s.key])}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
