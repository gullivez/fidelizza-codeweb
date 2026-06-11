import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, pageSize, total, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const go = (p: number) => onChange(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="flex items-center justify-between py-3 text-xs">
      <div className="text-muted-foreground tabular-nums">
        Mostrando <span className="font-medium text-foreground">{start}–{end}</span> de{" "}
        <span className="font-medium text-foreground">{total.toLocaleString("pt-BR")}</span>
      </div>
      <div className="inline-flex items-center gap-1">
        <button
          onClick={() => go(page - 1)}
          disabled={page === 1}
          className={cn(
            "inline-flex items-center gap-1 h-7 px-2 rounded border border-border text-foreground",
            "hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Anterior
        </button>
        {Array.from({ length: totalPages }).map((_, i) => {
          const p = i + 1;
          const active = p === page;
          return (
            <button
              key={p}
              onClick={() => go(p)}
              className={cn(
                "h-7 min-w-7 px-2 rounded border text-xs tabular-nums",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-foreground hover:bg-zinc-50",
              )}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          className={cn(
            "inline-flex items-center gap-1 h-7 px-2 rounded border border-border text-foreground",
            "hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          Próximo <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
