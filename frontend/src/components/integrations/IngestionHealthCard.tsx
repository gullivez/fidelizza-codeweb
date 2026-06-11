import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { INGESTION_24H, formatBR } from "@/lib/mock-integrations";

export function IngestionHealthCard() {
  const total = INGESTION_24H.reduce((acc, d) => acc + d.orders, 0);
  const visibleTicks = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Ingestão nas últimas 24h
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pedidos importados por hora a partir das integrações ativas.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-emerald-600 tabular-nums">
            {formatBR(total)}
          </div>
          <div className="text-xs text-muted-foreground">pedidos</div>
        </div>
      </header>

      <div className="mt-4 h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={INGESTION_24H} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              ticks={visibleTicks}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={28}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(99,102,241,0.08)" }}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
              }}
              labelFormatter={(l) => `Hora ${l}`}
              formatter={(v: number) => [`${v} pedidos`, "Importados"]}
            />
            <Bar dataKey="orders" fill="#6366f1" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
