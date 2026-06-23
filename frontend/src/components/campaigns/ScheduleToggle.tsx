import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMinScheduleInputValue } from "@/lib/api/campaigns";

export type DispatchMode = "now" | "schedule";

type Props = {
  dispatchMode: DispatchMode;
  onDispatchModeChange: (mode: DispatchMode) => void;
  scheduledAtLocal: string;
  onScheduledAtLocalChange: (value: string) => void;
};

export function ScheduleToggle({
  dispatchMode,
  onDispatchModeChange,
  scheduledAtLocal,
  onScheduledAtLocalChange,
}: Props) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
        Quando disparar
      </div>
      <div role="radiogroup" className="grid gap-3 sm:grid-cols-2 max-w-md">
        {[
          { value: "now" as const, label: "Disparar agora" },
          { value: "schedule" as const, label: "Agendar para depois" },
        ].map((opt) => {
          const active = dispatchMode === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onDispatchModeChange(opt.value)}
              className={cn(
                "text-left rounded-lg border p-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                active
                  ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600 text-indigo-900"
                  : "border-border bg-card hover:border-zinc-300 text-foreground",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {dispatchMode === "schedule" ? (
        <div className="mt-3 max-w-md">
          <Label htmlFor="scheduled-at" className="text-sm">
            Data e hora do disparo
          </Label>
          <Input
            id="scheduled-at"
            type="datetime-local"
            min={getMinScheduleInputValue()}
            value={scheduledAtLocal}
            onChange={(e) => onScheduledAtLocalChange(e.target.value)}
            className="mt-1.5 h-9"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">Horário de Brasília.</p>
        </div>
      ) : null}
    </div>
  );
}
