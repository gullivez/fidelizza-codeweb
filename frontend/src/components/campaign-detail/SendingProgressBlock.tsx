import { formatNumber } from "@/lib/mock-dashboard";

export function SendingProgressBlock({ sent, total }: { sent: number; total: number }) {
  const pct = total > 0 ? (sent / total) * 100 : 0;
  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-sm font-medium text-indigo-900">
          <span className="text-2xl font-semibold tabular-nums">{formatNumber(sent)}</span> de{" "}
          <span className="tabular-nums">{formatNumber(total)}</span> enviados
        </div>
        <div className="text-sm font-semibold text-indigo-900 tabular-nums">
          {pct.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%
        </div>
      </div>
      <div className="mt-3 h-2.5 w-full rounded-full bg-indigo-100 overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all animate-pulse"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 text-xs text-indigo-800/80">
        Enviando gradualmente para proteger seu número de WhatsApp contra bloqueios.
      </div>
    </div>
  );
}
