import { formatBRL, formatNumber } from "@/lib/mock-dashboard";

type Props = {
  total: number;
  receitaTotal: number;
  conversaoMedia: number;
};

export function CampaignsSummaryStrip({ total, receitaTotal, conversaoMedia }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x divide-y md:divide-y-0 divide-border">
        <Cell label="Total de campanhas" value={formatNumber(total)} />
        <Cell
          label="Receita total atribuída"
          value={formatBRL(receitaTotal)}
          emphasis
        />
        <Cell
          label="Conversão média"
          value={`${conversaoMedia.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`}
        />
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
    <div className="p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "mt-2 num text-2xl font-semibold tracking-tight tabular-nums " +
          (emphasis ? "text-emerald-600" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}
