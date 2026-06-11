import { cn } from "@/lib/utils";
import type { RFMScore } from "@/lib/mock-customer-detail";

const rows = [
  { key: "r", label: "Recência", help: "Quão recente foi a última compra", color: "bg-indigo-500" },
  { key: "f", label: "Frequência", help: "Com que frequência o cliente compra", color: "bg-emerald-500" },
  { key: "m", label: "Valor", help: "Quanto o cliente gasta em média", color: "bg-amber-500" },
] as const;

export function RFMIndicator({ score }: { score: RFMScore }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Perfil RFM</h3>
        <span className="text-xs text-muted-foreground">Escala 1–5</span>
      </div>
      <div className="space-y-3.5">
        {rows.map((row) => {
          const value = score[row.key];
          return (
            <div key={row.key} className="flex items-center gap-4">
              <div className="w-24 shrink-0">
                <div className="text-sm font-medium text-foreground">{row.label}</div>
                <div className="text-[11px] text-muted-foreground leading-tight">{row.help}</div>
              </div>
              <div className="flex items-center gap-1.5 flex-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      i < value ? row.color : "bg-zinc-200",
                    )}
                  />
                ))}
              </div>
              <span className="num text-sm font-semibold tabular-nums text-foreground w-10 text-right">
                {value}/5
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
