import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { CampaignDetailHeader } from "@/components/campaign-detail/CampaignDetailHeader";
import { SendingProgressBlock } from "@/components/campaign-detail/SendingProgressBlock";
import { FailedAlert } from "@/components/campaign-detail/FailedAlert";
import { PerformanceFunnel, type FunnelStep } from "@/components/campaign-detail/PerformanceFunnel";
import { TemplateBlock } from "@/components/campaign-detail/TemplateBlock";
import { ConfirmDispatchDialog } from "@/components/campaigns/wizard/DispatchDialogs";
import { useLayout } from "@/lib/layout-context";
import { campaignsApi, type ApiCampaignDetail } from "@/lib/api/campaigns";
import type { ApiError } from "@/lib/api-client";

export const Route = createFileRoute("/_app/campanhas/$campaignId")({
  head: () => ({ meta: [{ title: "Campanha — Fidelizza" }] }),
  component: CampaignDetailPage,
});

function buildFunnelSteps(c: ApiCampaignDetail): FunnelStep[] {
  const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);
  const enviados = c.funnel.queued + c.funnel.sent;
  return [
    {
      key: "alvos",
      label: "Alvos",
      value: c.totalTargets,
      display: c.totalTargets.toLocaleString("pt-BR"),
      pctNext: pct(enviados, c.totalTargets),
    },
    {
      key: "enviados",
      label: "Enviados",
      value: enviados,
      display: enviados.toLocaleString("pt-BR"),
      pctNext: pct(c.funnel.delivered, enviados),
    },
    {
      key: "entregues",
      label: "Entregues",
      value: c.funnel.delivered,
      display: c.funnel.delivered.toLocaleString("pt-BR"),
      pctNext: pct(c.funnel.read, c.funnel.delivered),
    },
    {
      key: "lidos",
      label: "Lidos",
      value: c.funnel.read,
      display: c.funnel.read.toLocaleString("pt-BR"),
    },
  ];
}

function CampaignDetailPage() {
  const { campaignId } = Route.useParams();
  const { activeRestaurant } = useLayout();
  const rid = activeRestaurant?.id ?? "";
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    data: campaign,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["campaign", rid, campaignId],
    queryFn: () => campaignsApi.get(rid, campaignId),
    enabled: !!rid,
    refetchInterval: (query) => (query.state.data?.status === "sending" ? 5000 : false),
  });

  const dispatchMutation = useMutation({
    mutationFn: () => campaignsApi.dispatch(rid, campaignId, crypto.randomUUID()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", rid, campaignId] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Falha ao disparar campanha"),
  });

  if (!isLoading && !campaign) {
    const status = (error as ApiError | null)?.status;
    const notFound = isError && status === 404;
    return (
      <EmptyState
        icon={Inbox}
        title={notFound ? "Campanha não encontrada" : "Falha ao carregar campanha"}
        description={
          notFound
            ? "A campanha que você procura não existe ou foi removida."
            : "Não foi possível buscar os dados da campanha agora."
        }
        action={
          <Button asChild>
            <Link to="/campanhas">Voltar para Campanhas</Link>
          </Button>
        }
      />
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <>
      <CampaignDetailHeader campaign={campaign} />

      {campaign.status === "failed" ? (
        <div className="flex flex-col gap-6">
          <FailedAlert />
          <TemplateBlock templateName={campaign.templateName} contentSid={campaign.contentSid} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {campaign.status === "sending" ? (
            <SendingProgressBlock
              sent={campaign.funnel.queued + campaign.funnel.sent}
              total={campaign.totalTargets}
            />
          ) : null}

          <PerformanceFunnel steps={buildFunnelSteps(campaign)} />

          {campaign.funnel.failed > 0 ? (
            <div className="text-sm text-rose-700">{campaign.funnel.failed} mensagens falharam</div>
          ) : null}

          <TemplateBlock templateName={campaign.templateName} contentSid={campaign.contentSid} />

          {campaign.status === "draft" ? (
            <div>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={dispatchMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Disparar campanha
              </Button>
            </div>
          ) : null}
        </div>
      )}

      <ConfirmDispatchDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        count={campaign.totalTargets}
        onConfirm={() => {
          setConfirmOpen(false);
          dispatchMutation.mutate();
        }}
      />
    </>
  );
}
