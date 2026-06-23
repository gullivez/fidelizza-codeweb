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
import { CampaignTargetsTable } from "@/components/campaign-detail/CampaignTargetsTable";
import {
  CancelScheduleDialog,
  ConfirmDispatchDialog,
} from "@/components/campaigns/wizard/DispatchDialogs";
import { ScheduleToggle, type DispatchMode } from "@/components/campaigns/ScheduleToggle";
import { useLayout } from "@/lib/layout-context";
import { formatDateTime } from "@/lib/campaign-format";
import { campaignsApi, toBrtIso, type ApiCampaignDetail } from "@/lib/api/campaigns";
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
  const [cancelScheduleOpen, setCancelScheduleOpen] = useState(false);
  const [dispatchMode, setDispatchMode] = useState<DispatchMode>("now");
  const [scheduledAtLocal, setScheduledAtLocal] = useState("");

  const {
    data: campaign,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["campaign", rid, campaignId],
    queryFn: () => campaignsApi.get(rid, campaignId),
    enabled: !!rid,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "sending") return 5000;
      if (status === "scheduled") return 30000;
      return false;
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: () =>
      campaignsApi.dispatch(
        rid,
        campaignId,
        crypto.randomUUID(),
        dispatchMode === "schedule" ? toBrtIso(scheduledAtLocal) : undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", rid, campaignId] });
    },
    onError: (err) => {
      const apiErr = err as ApiError;
      if (apiErr.status === 400) {
        toast.error("Escolha um horário com pelo menos 5 minutos de antecedência.");
        return;
      }
      toast.error(err instanceof Error ? err.message : "Falha ao disparar campanha");
    },
  });

  const cancelScheduleMutation = useMutation({
    mutationFn: () => campaignsApi.cancelSchedule(rid, campaignId),
    onSuccess: () => {
      toast.success("Agendamento cancelado.");
      setDispatchMode("now");
      setScheduledAtLocal("");
      queryClient.invalidateQueries({ queryKey: ["campaign", rid, campaignId] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Falha ao cancelar agendamento"),
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
            <div className="flex flex-col gap-4">
              <ScheduleToggle
                dispatchMode={dispatchMode}
                onDispatchModeChange={setDispatchMode}
                scheduledAtLocal={scheduledAtLocal}
                onScheduledAtLocalChange={setScheduledAtLocal}
              />
              <div>
                <Button
                  onClick={() => setConfirmOpen(true)}
                  disabled={
                    dispatchMutation.isPending ||
                    (dispatchMode === "schedule" && !scheduledAtLocal.trim())
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {dispatchMode === "schedule" ? "Agendar campanha" : "Disparar campanha"}
                </Button>
              </div>
            </div>
          ) : null}

          {campaign.status === "scheduled" ? (
            <div>
              <Button
                variant="outline"
                onClick={() => setCancelScheduleOpen(true)}
                disabled={cancelScheduleMutation.isPending}
                className="text-rose-700 border-rose-200 hover:bg-rose-50"
              >
                Cancelar agendamento
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {campaign.status !== "draft" && (
        <div className="mt-6">
          <CampaignTargetsTable restaurantId={rid} campaignId={campaignId} />
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
        scheduled={dispatchMode === "schedule"}
        scheduledAtLabel={scheduledAtLocal ? formatDateTime(toBrtIso(scheduledAtLocal)) : undefined}
      />

      <CancelScheduleDialog
        open={cancelScheduleOpen}
        onOpenChange={setCancelScheduleOpen}
        onConfirm={() => {
          setCancelScheduleOpen(false);
          cancelScheduleMutation.mutate();
        }}
      />
    </>
  );
}
