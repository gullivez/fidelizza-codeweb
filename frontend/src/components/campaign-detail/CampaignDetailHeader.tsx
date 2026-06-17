import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { formatLongDate, SEGMENT_LABELS } from "@/lib/campaign-format";
import type { ApiCampaignDetail } from "@/lib/api/campaigns";

export function CampaignDetailHeader({ campaign }: { campaign: ApiCampaignDetail }) {
  const dateLabel = campaign.sentAt
    ? `Enviada em ${formatLongDate(campaign.sentAt)}`
    : `Criada em ${formatLongDate(campaign.createdAt)}`;

  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-5 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{campaign.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <CampaignStatusBadge status={campaign.status} />
          <span>· {dateLabel}</span>
          <span>·</span>
          <span className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
            {SEGMENT_LABELS[campaign.segmentName] ?? campaign.segmentName}
          </span>
        </div>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link to="/campanhas">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </Button>
    </div>
  );
}
