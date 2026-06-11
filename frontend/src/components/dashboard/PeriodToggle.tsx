import { cn } from "@/lib/utils";
import type { Period } from "@/lib/mock-dashboard";

const options: { value: Period; label: string }[] = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
];

type Props = {
  value: Period;
  onChange: (v: Period) => void;
};

export function PeriodToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md bg-muted p-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 h-7 text-xs font-medium rounded transition-colors tabular-nums",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
