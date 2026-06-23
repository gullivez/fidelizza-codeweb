import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { formatNumber } from "@/lib/mock-dashboard";
import { formatShortDate, SEGMENT_LABELS } from "@/lib/campaign-format";
import { campaignsApi, type ApiCampaign } from "@/lib/api/campaigns";

type Props = {
  data: ApiCampaign[];
  loading?: boolean;
  restaurantId: string;
};

export function CampaignsTable({ data, loading, restaurantId }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<ApiCampaign | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignsApi.remove(restaurantId, id),
    onSuccess: () => {
      toast.success("Rascunho excluído.");
      queryClient.invalidateQueries({ queryKey: ["campaigns", restaurantId] });
      setPendingDelete(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Falha ao excluir rascunho");
      setPendingDelete(null);
    },
  });

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
          {r.status === "scheduled" && r.scheduledAt
            ? formatShortDate(r.scheduledAt)
            : formatShortDate(r.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) =>
        r.status === "draft" ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setPendingDelete(r);
            }}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-rose-600" />
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate({ to: "/campanhas/$campaignId", params: { campaignId: r.id } })}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este rascunho?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
