import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { CampaignsSummaryStrip } from "@/components/campaigns/CampaignsSummaryStrip";
import { CampaignFilters } from "@/components/campaigns/CampaignFilters";
import { CampaignsTable } from "@/components/campaigns/CampaignsTable";
import { CampaignsEmpty } from "@/components/campaigns/CampaignsEmpty";
import {
  MOCK_CAMPAIGNS,
  filterCampaigns,
  getCampaignSummary,
  type StatusFilter,
} from "@/lib/mock-campaigns";
import type { Period } from "@/lib/mock-dashboard";

type ViewState = "populated" | "loading" | "empty";

type Search = { view?: ViewState };

export const Route = createFileRoute("/_app/campanhas/")({
  head: () => ({ meta: [{ title: "Campanhas — Fidelizza" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    view:
      s.view === "loading" || s.view === "empty" || s.view === "populated"
        ? (s.view as ViewState)
        : undefined,
  }),
  component: CampaignsPage,
});

function CampaignsPage() {
  const { view = "populated" } = Route.useSearch();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [periodo, setPeriodo] = useState<Period>("30d");

  const filtered = useMemo(
    () => filterCampaigns(MOCK_CAMPAIGNS, { status, periodo }),
    [status, periodo],
  );
  const summary = useMemo(() => getCampaignSummary(filtered), [filtered]);

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
      <PageHeader
        title="Campanhas"
        subtitle="Histórico e performance"
        action={newCampaignButton}
      />

      {view === "empty" ? (
        <CampaignsEmpty />
      ) : (
        <div className="flex flex-col gap-5">
          <CampaignsSummaryStrip
            total={summary.total}
            receitaTotal={summary.receitaTotal}
            conversaoMedia={summary.conversaoMedia}
          />
          <CampaignFilters
            status={status}
            onStatusChange={setStatus}
            periodo={periodo}
            onPeriodoChange={setPeriodo}
          />
          <CampaignsTable data={filtered} loading={view === "loading"} />
        </div>
      )}
    </>
  );
}
