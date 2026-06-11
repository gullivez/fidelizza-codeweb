import { formatNumber } from "@/lib/mock-dashboard";

export function SendingProgress({ enviados, total }: { enviados: number; total: number }) {
  const pct = total === 0 ? 0 : Math.min(100, (enviados / total) * 100);
  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <div className="text-xs text-muted-foreground tabular-nums">
        {formatNumber(enviados)}/{formatNumber(total)} enviados
      </div>
      <div className="h-1.5 w-full rounded-full bg-indigo-100 overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
