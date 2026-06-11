import type { CampaignKpis } from "@/lib/mock-campaign-detail";
import { formatBRL } from "@/lib/mock-dashboard";

export function CampaignKpiStrip({ kpis }: { kpis: CampaignKpis }) {
  const pct = (n: number) =>
    `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-5 md:divide-x divide-y md:divide-y-0 divide-border">
        <Cell label="Taxa de entrega" value={pct(kpis.taxaEntrega)} />
        <Cell label="Taxa de leitura" value={pct(kpis.taxaLeitura)} />
        <Cell label="Taxa de conversão" value={pct(kpis.taxaConversao)} />
        <Cell label="Receita atribuída" value={formatBRL(kpis.receita)} emphasis />
        <Cell label="Ticket médio" value={formatBRL(kpis.ticketMedio)} />
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "mt-1.5 text-xl font-semibold tabular-nums tracking-tight " +
          (emphasis ? "text-emerald-600" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}
