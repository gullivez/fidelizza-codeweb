import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { CampaignFilters, type StatusFilter } from "@/components/campaigns/CampaignFilters";
import { CampaignsTable } from "@/components/campaigns/CampaignsTable";
import { CampaignsEmpty } from "@/components/campaigns/CampaignsEmpty";
import { useLayout } from "@/lib/layout-context";
import { campaignsApi } from "@/lib/api/campaigns";

export const Route = createFileRoute("/_app/campanhas/")({
  head: () => ({ meta: [{ title: "Campanhas — Fidelizza" }] }),
  component: CampaignsPage,
});

function CampaignsPage() {
  const { activeRestaurant } = useLayout();
  const rid = activeRestaurant?.id ?? "";
  const [status, setStatus] = useState<StatusFilter>("all");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["campaigns", rid],
    queryFn: () => campaignsApi.list(rid),
    enabled: !!rid,
  });

  const filtered = useMemo(() => {
    const list = data ?? [];
    return status === "all" ? list : list.filter((c) => c.status === status);
  }, [data, status]);

  const newCampaignButton = (
    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
      <Link to="/campanhas/nova">
        <Plus className="h-4 w-4" />
        Nova Campanha
      </Link>
    </Button>
  );

  return (
    <>
      <PageHeader title="Campanhas" subtitle="Histórico e performance" action={newCampaignButton} />

      {!rid ? (
        <EmptyState
          icon={AlertTriangle}
          title="Selecione um restaurante"
          description="Escolha um restaurante para ver as campanhas."
        />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Falha ao carregar campanhas"
          description="Não foi possível buscar as campanhas agora."
          action={<Button onClick={() => refetch()}>Tentar novamente</Button>}
        />
      ) : !isLoading && (data?.length ?? 0) === 0 ? (
        <CampaignsEmpty />
      ) : (
        <div className="flex flex-col gap-5">
          <CampaignFilters status={status} onStatusChange={setStatus} />
          <CampaignsTable data={filtered} loading={isLoading} restaurantId={rid} />
        </div>
      )}
    </>
  );
}
