import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Info, Users } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge, type StatusVariant } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/customers/Pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  campaignsApi,
  type ApiCampaignTarget,
  type CampaignTargetStatus,
} from "@/lib/api/campaigns";
import { formatDateTimeShort } from "@/lib/campaign-format";

const PAGE_SIZE = 50;

const STATUS_LABEL: Record<CampaignTargetStatus, string> = {
  queued: "Pendente",
  sent: "Enviado",
  delivered: "Entregue",
  read: "Lido",
  failed: "Falhou",
};

const STATUS_VARIANT: Record<CampaignTargetStatus, StatusVariant> = {
  queued: "neutral",
  sent: "info",
  delivered: "success",
  read: "success",
  failed: "danger",
};

function StatusCell({ target }: { target: ApiCampaignTarget }) {
  const badge = (
    <StatusBadge
      variant={STATUS_VARIANT[target.status]}
      className={
        target.status === "read" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : undefined
      }
    >
      {STATUS_LABEL[target.status]}
    </StatusBadge>
  );

  if (target.status !== "failed" || !target.failureReason) return badge;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1.5">
            {badge}
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {target.failureReason}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function CampaignTargetsTable({
  restaurantId,
  campaignId,
}: {
  restaurantId: string;
  campaignId: string;
}) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["campaign-targets", restaurantId, campaignId, page],
    queryFn: () => campaignsApi.listTargets(restaurantId, campaignId, { page, limit: PAGE_SIZE }),
    enabled: !!restaurantId && !!campaignId,
  });

  const columns: Column<ApiCampaignTarget>[] = [
    {
      key: "customerName",
      header: "Nome",
      accessor: (r) => r.customerName,
      cell: (r) => <span className="font-medium text-foreground">{r.customerName}</span>,
    },
    {
      key: "customerPhone",
      header: "Telefone",
      accessor: (r) => r.customerPhone,
      cell: (r) => (
        <span className="num tabular-nums text-muted-foreground">{r.customerPhone}</span>
      ),
      width: "160px",
    },
    {
      key: "status",
      header: "Status",
      width: "150px",
      cell: (r) => <StatusCell target={r} />,
    },
    {
      key: "sentAt",
      header: "Data de envio",
      width: "180px",
      cell: (r) => (
        <span className="num tabular-nums text-muted-foreground">
          {r.sentAt ? formatDateTimeShort(r.sentAt) : "—"}
        </span>
      ),
    },
  ];

  const total = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">Clientes desta campanha</h2>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        rowKey={(r) => r.customerId}
        emptyState={
          <EmptyState
            icon={Users}
            title="Nenhum cliente disparado ainda"
            description="Assim que a campanha começar a enviar, os clientes aparecerão aqui."
          />
        }
      />
      {total > 0 && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      )}
    </div>
  );
}
