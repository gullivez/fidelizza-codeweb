import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusVariant } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";
import { segmentLabels } from "@/lib/mock-customers";
import { formatPhone, type CustomerDetail } from "@/lib/mock-customer-detail";

const segmentVariant: Record<CustomerDetail["segment"], StatusVariant> = {
  campeoes: "success",
  novos: "info",
  "em-risco": "warning",
  inativos: "danger",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function CustomerHeader({ customer }: { customer: CustomerDetail }) {
  const optOut = !!customer.optOut;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-5 mb-6">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold shrink-0">
          {initials(customer.name)}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground truncate">
            {customer.name}
          </h1>
          <div className="mt-1 flex items-center gap-2 flex-wrap text-sm">
            <span className="num tabular-nums text-muted-foreground">
              {formatPhone(customer.phone)}
            </span>
            <span className="text-zinc-300">·</span>
            <StatusBadge variant={segmentVariant[customer.segment]}>
              {segmentLabels[customer.segment]}
            </StatusBadge>
            <ConsentChip optOut={optOut} />
          </div>
        </div>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link to="/clientes" search={{ segmento: "todos", q: "", page: 1 }}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </Button>
    </div>
  );
}

function ConsentChip({ optOut }: { optOut: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        optOut
          ? "bg-zinc-100 text-zinc-600 border-zinc-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200",
      )}
    >
      {optOut ? <BellOff className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
      {optOut ? "Opt-out" : "Recebe campanhas"}
    </span>
  );
}
