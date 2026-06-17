import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type WizardStep = 1 | 2 | 3;

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 1, label: "Público" },
  { id: 2, label: "Mensagem" },
  { id: 3, label: "Revisão" },
];

export function Stepper({ current }: { current: WizardStep }) {
  const currentItem = STEPS.find((s) => s.id === current)!;
  return (
    <>
      {/* Desktop */}
      <ol className="hidden sm:flex items-center gap-2 w-full">
        {STEPS.map((s, i) => {
          const done = s.id < current;
          const active = s.id === current;
          return (
            <li key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    done && "bg-emerald-600 border-emerald-600 text-white",
                    active && "border-indigo-600 text-indigo-600 bg-white",
                    !done && !active && "border-border text-muted-foreground bg-white",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : s.id}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    active && "text-foreground",
                    done && "text-foreground",
                    !done && !active && "text-muted-foreground",
                  )}
                >
                  {s.id}. {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 ? <div className="flex-1 h-px bg-border mx-2" /> : null}
            </li>
          );
        })}
      </ol>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Passo {current} de {STEPS.length}
          </span>
          <span className="text-sm font-medium text-foreground">{currentItem.label}</span>
        </div>
        <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${(current / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}
