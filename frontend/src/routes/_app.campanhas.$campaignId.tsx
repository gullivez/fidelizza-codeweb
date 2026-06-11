import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { CampaignDetailHeader } from "@/components/campaign-detail/CampaignDetailHeader";
import { SendingProgressBlock } from "@/components/campaign-detail/SendingProgressBlock";
import { FailedAlert } from "@/components/campaign-detail/FailedAlert";
import { PendingAttributionNote } from "@/components/campaign-detail/PendingAttributionNote";
import { PerformanceFunnel } from "@/components/campaign-detail/PerformanceFunnel";
import { CampaignKpiStrip } from "@/components/campaign-detail/CampaignKpiStrip";
import { MessageBlock } from "@/components/campaign-detail/MessageBlock";
import { RecipientsTable } from "@/components/campaign-detail/RecipientsTable";
import {
  funnelSteps,
  getCampaignDetail,
  getDerivedStatus,
  getKpis,
  getRecipients,
} from "@/lib/mock-campaign-detail";

export const Route = createFileRoute("/_app/campanhas/$campaignId")({
  head: () => ({ meta: [{ title: "Campanha — Fidelizza" }] }),
  component: CampaignDetailPage,
});

function CampaignDetailPage() {
  const { campaignId } = Route.useParams();
  const campaign = getCampaignDetail(campaignId);

  if (!campaign) {
    return (
      <EmptyState
        icon={Inbox}
        title="Campanha não encontrada"
        description="A campanha que você procura não existe ou foi removida."
        action={
          <Button asChild>
            <Link to="/campanhas">Voltar para Campanhas</Link>
          </Button>
        }
      />
    );
  }

  const derived = getDerivedStatus(campaign);
  const recipients = getRecipients(campaign);

  return (
    <>
      <CampaignDetailHeader campaign={campaign} />

      {derived === "failed" ? (
        <div className="flex flex-col gap-6">
          <FailedAlert motivo={campaign.motivoFalha} />
          <MessageBlock mensagem={campaign.mensagem} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {derived === "sending" ? (
            <SendingProgressBlock
              enviados={campaign.enviados}
              total={campaign.total}
            />
          ) : null}

          {derived === "sent-pending" ? (
            <PendingAttributionNote janelaFim={campaign.janelaAtribuicaoFim} />
          ) : null}

          <PerformanceFunnel steps={funnelSteps(campaign)} />
          <CampaignKpiStrip kpis={getKpis(campaign)} />
          <MessageBlock mensagem={campaign.mensagem} />
          <RecipientsTable data={recipients} />
        </div>
      )}
    </>
  );
}
