import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
};

// Returns the page slots to render: numbers or the string "…" for gaps.
function pageSlots(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const delta = 2; // pages on each side of current
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  const slots: (number | "…")[] = [1];
  if (left > 2) slots.push("…");
  for (let p = left; p <= right; p++) slots.push(p);
  if (right < total - 1) slots.push("…");
  slots.push(total);
  return slots;
}

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

        {pageSlots(page, totalPages).map((slot, i) =>
          slot === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="h-7 min-w-7 px-1 flex items-center justify-center text-muted-foreground"
            >
              …
            </span>
          ) : (
            <button
              key={slot}
              onClick={() => go(slot)}
              className={cn(
                "h-7 min-w-7 px-2 rounded border text-xs tabular-nums",
                slot === page
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-foreground hover:bg-zinc-50",
              )}
            >
              {slot}
            </button>
          ),
        )}

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
