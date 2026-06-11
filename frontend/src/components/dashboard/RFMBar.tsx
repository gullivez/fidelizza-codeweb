import { Link } from "@tanstack/react-router";
import { formatNumber, type DashboardData } from "@/lib/mock-dashboard";

type Props = { data: DashboardData["rfm"] };

const segments = [
  { key: "champions", label: "Campeões", color: "bg-emerald-500", dot: "bg-emerald-500", slug: "campeoes" },
  { key: "new", label: "Novos", color: "bg-indigo-500", dot: "bg-indigo-500", slug: "novos" },
  { key: "atRisk", label: "Em Risco", color: "bg-amber-500", dot: "bg-amber-500", slug: "em-risco" },
  { key: "inactive", label: "Inativos", color: "bg-rose-500", dot: "bg-rose-500", slug: "inativos" },
] as const;

export function RFMBar({ data }: Props) {
  const total = data.champions + data.new + data.atRisk + data.inactive;
  const items = segments.map((s) => {
    const count = data[s.key];
    const pct = (count / total) * 100;
    return { ...s, count, pct };
  });

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Saúde da base (RFM)</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatNumber(total)} clientes
        </span>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {items.map((it) => (
          <div
            key={it.key}
            className={it.color}
            style={{ width: `${it.pct}%` }}
            title={`${it.label}: ${it.count}`}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((it) => (
          <Link
            key={it.key}
            to="/clientes"
            search={{ segmento: it.slug } as never}
            className="group rounded-md border border-border p-3 hover:bg-zinc-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${it.dot}`} />
              <span className="text-xs font-medium text-foreground">{it.label}</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="num text-lg font-semibold text-foreground">
                {formatNumber(it.count)}
              </span>
              <span className="num text-xs text-muted-foreground">
                {it.pct.toFixed(0)}%
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
