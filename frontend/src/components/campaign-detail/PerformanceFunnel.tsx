import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FunnelStep } from "@/lib/mock-campaign-detail";

export function PerformanceFunnel({ steps }: { steps: FunnelStep[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-stretch gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-stretch gap-2 flex-1 last:flex-none">
            <StepCell step={s} />
            {i < steps.length - 1 ? (
              <div className="flex flex-col items-center justify-center">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                {typeof s.pctNext === "number" ? (
                  <span className="mt-1 inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium tabular-nums text-zinc-700">
                    {s.pctNext.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden flex flex-col gap-2">
        {steps.map((s, i) => (
          <div key={s.key}>
            <StepCell step={s} />
            {i < steps.length - 1 ? (
              <div className="flex items-center justify-center gap-2 py-1.5">
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                {typeof s.pctNext === "number" ? (
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium tabular-nums text-zinc-700">
                    {s.pctNext.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCell({ step }: { step: FunnelStep }) {
  return (
    <div
      className={cn(
        "flex-1 rounded-md px-3 py-3 text-center min-w-0",
        step.highlight ? "bg-emerald-50 border border-emerald-200" : "bg-zinc-50",
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {step.label}
      </div>
      <div
        className={cn(
          "mt-1 tabular-nums font-semibold tracking-tight",
          step.highlight ? "text-emerald-600 text-2xl md:text-3xl" : "text-foreground text-xl md:text-2xl",
        )}
      >
        {step.display}
      </div>
    </div>
  );
}
