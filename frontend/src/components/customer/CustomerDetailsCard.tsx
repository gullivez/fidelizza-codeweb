import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CustomerDetail } from "@/lib/mock-customer-detail";

export function CustomerDetailsCard({ customer }: { customer: CustomerDetail }) {
  const rows = [
    { label: "Email", value: customer.email },
    {
      label: "Aniversário",
      value: format(new Date(customer.birthday), "dd 'de' MMMM", { locale: ptBR }),
    },
    { label: "Origem", value: customer.source },
    {
      label: "Cadastrado em",
      value: format(new Date(customer.createdAt), "dd/MM/yyyy", { locale: ptBR }),
    },
  ];
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Detalhes</h3>
      <dl className="space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {r.label}
            </dt>
            <dd className="mt-0.5 text-sm text-foreground break-words">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
