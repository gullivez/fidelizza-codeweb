import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge, type StatusVariant } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { OptOutIcon } from "./OptOutIcon";
import { Inbox } from "lucide-react";
import { segmentLabels, type Customer } from "@/lib/mock-customers";

const segmentVariant: Record<Customer["segment"], StatusVariant> = {
  campeoes: "success",
  novos: "info",
  "em-risco": "warning",
  inativos: "danger",
};

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function relative(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR });
}

type Props = {
  data: Customer[];
  loading?: boolean;
};

export function CustomersTable({ data, loading }: Props) {
  const navigate = useNavigate();

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Nome",
      accessor: (r) => r.name,
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-foreground truncate">{r.name}</span>
          {r.optOut ? <OptOutIcon /> : null}
        </div>
      ),
    },
    {
      key: "phone",
      header: "Telefone",
      accessor: (r) => r.phone,
      cell: (r) => <span className="num tabular-nums text-muted-foreground">{r.phone}</span>,
      width: "160px",
    },
    {
      key: "segment",
      header: "Segmento",
      accessor: (r) => r.segment,
      sortable: true,
      width: "130px",
      cell: (r) => (
        <StatusBadge variant={segmentVariant[r.segment]}>{segmentLabels[r.segment]}</StatusBadge>
      ),
    },
    {
      key: "lastOrderAt",
      header: "Último pedido",
      accessor: (r) => new Date(r.lastOrderAt).getTime(),
      sortable: true,
      width: "170px",
      cell: (r) => <span className="text-muted-foreground">{relative(r.lastOrderAt)}</span>,
    },
    {
      key: "orders",
      header: "Pedidos",
      accessor: (r) => r.orders,
      align: "right",
      sortable: true,
      width: "90px",
      cell: (r) => <span className="num tabular-nums">{r.orders}</span>,
    },
    {
      key: "totalSpent",
      header: "Total gasto",
      accessor: (r) => r.totalSpent,
      align: "right",
      sortable: true,
      width: "120px",
      cell: (r) => (
        <span className="num tabular-nums font-medium text-foreground">
          {formatBRL(r.totalSpent)}
        </span>
      ),
    },
    {
      key: "avg",
      header: "Ticket médio",
      accessor: (r) => (r.orders ? r.totalSpent / r.orders : 0),
      align: "right",
      sortable: true,
      width: "120px",
      cell: (r) => (
        <span className="num tabular-nums text-muted-foreground">
          {formatBRL(r.orders ? r.totalSpent / r.orders : 0)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      rowKey={(r) => r.id}
      onRowClick={(r) =>
        navigate({ to: "/clientes/$customerId", params: { customerId: r.id } })
      }
      emptyState={
        <EmptyState
          icon={Inbox}
          title="Nenhum cliente neste segmento agora 👏"
          description="Quando novos clientes entrarem para este grupo, eles aparecerão aqui."
        />
      }
    />
  );
}
