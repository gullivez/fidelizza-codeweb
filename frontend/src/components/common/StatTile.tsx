import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Delta = { value: string; direction: "up" | "down" };

type Props = {
  label: string;
  value: string | number;
  delta?: Delta;
  tone?: "default" | "revenue";
  hint?: string;
};

export function StatTile({ label, value, delta, tone = "default", hint }: Props) {
  const isRevenue = tone === "revenue";
  return (
    <div className="px-5 py-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <span
          className={cn(
            "num text-3xl font-semibold tracking-tight",
            isRevenue ? "text-success" : "text-foreground",
          )}
        >
          {value}
        </span>
        {delta ? (
          <span
            className={cn(
              "num inline-flex items-center gap-0.5 text-xs font-medium",
              delta.direction === "up" ? "text-success" : "text-destructive",
            )}
          >
            {delta.direction === "up" ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {delta.value}
          </span>
        ) : null}
      </div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
