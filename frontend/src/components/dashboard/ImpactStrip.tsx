import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL, formatNumber } from "@/lib/mock-dashboard";
import type { DashboardData } from "@/lib/mock-dashboard";

type Props = { data: DashboardData["kpis"] };

export function ImpactStrip({ data }: Props) {
  const up = data.revenueDelta >= 0;
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:divide-x divide-y md:divide-y-0 divide-border">
        {/* Hero */}
        <div className="p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Receita recuperada
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="num text-4xl font-semibold tracking-tight text-success">
              {formatBRL(data.revenue)}
            </span>
            <span
              className={cn(
                "num inline-flex items-center gap-0.5 text-xs font-medium",
                up ? "text-success" : "text-destructive",
              )}
            >
              {up ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(data.revenueDelta)}% vs período anterior
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Atribuída a campanhas de reativação no período.
          </div>
        </div>

        <Secondary label="Conversão" value={`${data.conversion.toLocaleString("pt-BR")}%`} />
        <Secondary label="Clientes reativados" value={formatNumber(data.reactivated)} />
        <Secondary label="Campanhas enviadas" value={formatNumber(data.campaignsSent)} />
      </div>
    </div>
  );
}

function Secondary({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 num text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
    </div>
  );
}
