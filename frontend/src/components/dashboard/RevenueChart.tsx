import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBRL, type RevenuePoint } from "@/lib/mock-dashboard";

type Props = { data: RevenuePoint[] };

export function RevenueChart({ data }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Receita gerada por campanhas
        </h3>
        <span className="text-xs text-muted-foreground">Atribuída por janela de 7 dias</span>
      </div>
      <div className="h-[280px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e4e4e7" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#a1a1aa"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              stroke="#a1a1aa"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v) => `R$ ${v}`}
            />
            <Tooltip
              cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "3 3" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-md text-xs">
                    <div className="text-muted-foreground tabular-nums">{label}</div>
                    <div className="mt-0.5 font-semibold tabular-nums text-foreground">
                      {formatBRL(Number(payload[0].value))}
                    </div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#059669"
              strokeWidth={2}
              fill="url(#revenueArea)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
