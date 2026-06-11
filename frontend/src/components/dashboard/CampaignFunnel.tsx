import { cn } from "@/lib/utils";
import { formatBRL, formatNumber, type DashboardData } from "@/lib/mock-dashboard";

type Props = { data: DashboardData["lastCampaign"] };

export function CampaignFunnel({ data }: Props) {
  const steps = [
    { label: "Enviados", value: data.sent, display: formatNumber(data.sent) },
    { label: "Entregues", value: data.delivered, display: formatNumber(data.delivered) },
    { label: "Lidos", value: data.read, display: formatNumber(data.read) },
    { label: "Pedidos", value: data.orders, display: formatNumber(data.orders) },
    {
      label: "Receita",
      value: data.revenue,
      display: formatBRL(data.revenue),
      isRevenue: true as const,
    },
  ];

  const max = steps[0].value;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Funil da última campanha</h3>
        <span className="text-xs text-muted-foreground truncate">"{data.name}"</span>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, i) => {
          const prev = i > 0 ? steps[i - 1].value : null;
          const conversion = prev && prev > 0 && !step.isRevenue ? (step.value / prev) * 100 : null;
          const width = step.isRevenue
            ? 100
            : Math.max(8, (step.value / max) * 100);
          const isLast = step.isRevenue;
          return (
            <div key={step.label} className="flex items-center gap-3">
              <div className="w-20 text-xs font-medium text-muted-foreground shrink-0">
                {step.label}
              </div>
              <div className="flex-1 relative h-8 rounded bg-zinc-100 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded transition-all",
                    isLast ? "bg-emerald-500" : "bg-indigo-500/80",
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
              <div className="w-28 text-right shrink-0">
                <div
                  className={cn(
                    "num text-sm font-semibold tabular-nums",
                    isLast ? "text-success" : "text-foreground",
                  )}
                >
                  {step.display}
                </div>
                {conversion !== null ? (
                  <div className="num text-[10px] text-muted-foreground">
                    {conversion.toFixed(1)}% do anterior
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
