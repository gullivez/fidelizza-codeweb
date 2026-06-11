import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge, type StatusVariant } from "@/components/common/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBRL, formatNumber } from "@/lib/mock-dashboard";
import type { MessageStatus, Recipient } from "@/lib/mock-campaign-detail";

const STATUS_LABEL: Record<MessageStatus, string> = {
  enviado: "Enviado",
  entregue: "Entregue",
  lido: "Lido",
  falha: "Falha",
  convertido: "Convertido",
};

const STATUS_VARIANT: Record<MessageStatus, StatusVariant> = {
  enviado: "neutral",
  entregue: "info",
  lido: "info",
  falha: "danger",
  convertido: "success",
};

type Filter = MessageStatus | "all";

export function RecipientsTable({ data }: { data: Recipient[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () => (filter === "all" ? data : data.filter((r) => r.messageStatus === filter)),
    [data, filter],
  );

  const columns: Column<Recipient>[] = [
    {
      key: "nome",
      header: "Nome",
      sortable: true,
      accessor: (r) => r.nome,
      cell: (r) => (
        <span
          className={
            r.messageStatus === "convertido"
              ? "font-medium text-foreground"
              : "text-foreground"
          }
        >
          {r.nome}
        </span>
      ),
    },
    {
      key: "telefone",
      header: "Telefone",
      accessor: (r) => r.telefone,
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.telefone}</span>,
    },
    {
      key: "status",
      header: "Status da mensagem",
      sortable: true,
      accessor: (r) => r.messageStatus,
      cell: (r) => (
        <StatusBadge variant={STATUS_VARIANT[r.messageStatus]}>
          {STATUS_LABEL[r.messageStatus]}
        </StatusBadge>
      ),
    },
    {
      key: "converteu",
      header: "Converteu?",
      align: "right",
      sortable: true,
      accessor: (r) => r.valorPedido ?? 0,
      cell: (r) =>
        r.messageStatus === "convertido" && r.valorPedido ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 tabular-nums">
            <Check className="h-3.5 w-3.5" />
            {formatBRL(r.valorPedido)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Destinatários</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatNumber(filtered.length)} destinatários
          </span>
          <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <SelectTrigger className="h-9 w-[180px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="lido">Lido</SelectItem>
              <SelectItem value="falha">Falha</SelectItem>
              <SelectItem value="convertido">Convertido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DataTable columns={columns} data={filtered} rowKey={(r) => r.id} />
    </div>
  );
}
