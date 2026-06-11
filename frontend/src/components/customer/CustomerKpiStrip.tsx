import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL } from "@/lib/mock-customer-detail";

type Props = {
  totalSpent: number;
  orders: number;
  avgTicket: number;
  customerSince: string;
  lastOrderAt: string;
};

export function CustomerKpiStrip(p: Props) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden mb-6">
      <div className="grid grid-cols-2 md:grid-cols-5 md:divide-x divide-y md:divide-y-0 divide-border">
        <Cell label="Total gasto" value={formatBRL(p.totalSpent)} accent />
        <Cell label="Pedidos" value={p.orders.toString()} />
        <Cell label="Ticket médio" value={formatBRL(Math.round(p.avgTicket))} />
        <Cell
          label="Cliente desde"
          value={format(new Date(p.customerSince), "MMM yyyy", { locale: ptBR })}
        />
        <Cell
          label="Última compra"
          value={formatDistanceToNow(new Date(p.lastOrderAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        />
      </div>
    </div>
  );
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "mt-1.5 num text-xl font-semibold tabular-nums tracking-tight " +
          (accent ? "text-success" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}
