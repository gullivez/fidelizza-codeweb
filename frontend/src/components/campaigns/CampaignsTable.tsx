import { useNavigate } from "@tanstack/react-router";
import { DataTable, type Column } from "@/components/common/DataTable";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { SendingProgress } from "./SendingProgress";
import { formatBRL, formatNumber } from "@/lib/mock-dashboard";
import { formatShortDate, type Campaign } from "@/lib/mock-campaigns";

type Props = {
  data: Campaign[];
  loading?: boolean;
};

export function CampaignsTable({ data, loading }: Props) {
  const navigate = useNavigate();

  const columns: Column<Campaign>[] = [
    {
      key: "nome",
      header: "Nome",
      sortable: true,
      accessor: (r) => r.nome,
      cell: (r) => <span className="font-medium text-foreground">{r.nome}</span>,
    },
    {
      key: "segmento",
      header: "Segmento-alvo",
      accessor: (r) => r.segmentoAlvo,
      cell: (r) => (
        <span className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {r.segmentoAlvo}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (r) => r.status,
      cell: (r) => <CampaignStatusBadge status={r.status} />,
    },
    {
      key: "enviados",
      header: "Enviados",
      sortable: true,
      accessor: (r) => r.enviados,
      cell: (r) =>
        r.status === "sending" ? (
          <SendingProgress enviados={r.enviados} total={r.total} />
        ) : (
          <span className="tabular-nums">{formatNumber(r.enviados)}</span>
        ),
    },
    {
      key: "entregues",
      header: "Entregues",
      sortable: true,
      accessor: (r) => r.entregues,
      cell: (r) => {
        if (r.enviados === 0) return <span className="text-muted-foreground">—</span>;
        const pct = (r.entregues / r.enviados) * 100;
        return (
          <span className="tabular-nums">
            {formatNumber(r.entregues)}{" "}
            <span className="text-xs text-muted-foreground">
              ({pct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%)
            </span>
          </span>
        );
      },
    },
    {
      key: "conversoes",
      header: "Conversões",
      sortable: true,
      accessor: (r) => r.conversoes,
      cell: (r) =>
        r.conversoes > 0 ? (
          <span className="tabular-nums">{formatNumber(r.conversoes)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "receita",
      header: "Receita",
      align: "right",
      sortable: true,
      accessor: (r) => r.receita,
      cell: (r) =>
        r.receita > 0 ? (
          <span className="tabular-nums font-medium text-emerald-600">
            {formatBRL(r.receita)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "data",
      header: "Data",
      sortable: true,
      accessor: (r) => r.data,
      cell: (r) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatShortDate(r.data)}
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
        navigate({ to: "/campanhas/$campaignId", params: { campaignId: r.id } })
      }
    />
  );
}
