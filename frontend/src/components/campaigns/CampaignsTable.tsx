import { useNavigate } from "@tanstack/react-router";
import { DataTable, type Column } from "@/components/common/DataTable";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { formatNumber } from "@/lib/mock-dashboard";
import { formatShortDate, SEGMENT_LABELS } from "@/lib/campaign-format";
import type { ApiCampaign } from "@/lib/api/campaigns";

type Props = {
  data: ApiCampaign[];
  loading?: boolean;
};

export function CampaignsTable({ data, loading }: Props) {
  const navigate = useNavigate();

  const columns: Column<ApiCampaign>[] = [
    {
      key: "name",
      header: "Nome",
      sortable: true,
      accessor: (r) => r.name,
      cell: (r) => <span className="font-medium text-foreground">{r.name}</span>,
    },
    {
      key: "segmento",
      header: "Segmento-alvo",
      accessor: (r) => r.segmentName,
      cell: (r) => (
        <span className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {SEGMENT_LABELS[r.segmentName] ?? r.segmentName}
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
      key: "totalTargets",
      header: "Alcance",
      align: "right",
      sortable: true,
      accessor: (r) => r.totalTargets,
      cell: (r) => <span className="tabular-nums">{formatNumber(r.totalTargets)}</span>,
    },
    {
      key: "createdAt",
      header: "Data",
      sortable: true,
      accessor: (r) => r.createdAt,
      cell: (r) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatShortDate(r.createdAt)}
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
      onRowClick={(r) => navigate({ to: "/campanhas/$campaignId", params: { campaignId: r.id } })}
    />
  );
}
