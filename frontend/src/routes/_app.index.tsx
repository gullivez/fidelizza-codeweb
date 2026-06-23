import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLayout } from "@/lib/layout-context";
import { useAnalytics } from "@/hooks/use-analytics";
import type { AnalyticsPeriod } from "@/lib/api/analytics";
import { PeriodToggle } from "@/components/dashboard/PeriodToggle";
import { ImpactStrip } from "@/components/dashboard/ImpactStrip";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RFMBar } from "@/components/dashboard/RFMBar";
import { CampaignFunnel } from "@/components/dashboard/CampaignFunnel";
import { OpportunitiesTable } from "@/components/dashboard/OpportunitiesTable";
import { NeverSentCTA } from "@/components/dashboard/NeverSentCTA";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Fidelizza" },
      { name: "description", content: "Prova de ROI da reativação de clientes em tempo real." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { activeRestaurant } = useLayout();
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const { dashboard, rfm, loading } = useAnalytics(activeRestaurant?.id, period);

  const actions = (
    <>
      <PeriodToggle value={period} onChange={setPeriod} />
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Plus className="h-4 w-4" />
        Nova campanha
      </Button>
    </>
  );

  const ready = !loading && dashboard && rfm;
  const neverSent = ready && dashboard.kpis.campaignsSent === 0;

  return (
    <>
      <PageHeader title="Dashboard" subtitle={activeRestaurant?.name ?? ""} action={actions} />

      {!ready ? (
        <LoadingShell />
      ) : neverSent ? (
        <NeverSentCTA inactiveCount={rfm.inactive} />
      ) : (
        <div className="space-y-5">
          <ImpactStrip data={dashboard.kpis} />

          <RevenueChart data={[]} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <RFMBar data={rfm} />
            {dashboard.lastCampaign ? (
              <CampaignFunnel data={dashboard.lastCampaign} />
            ) : (
              <div className="rounded-lg border border-border bg-card p-5 flex items-center justify-center text-sm text-muted-foreground h-full">
                Nenhuma campanha enviada ainda.
              </div>
            )}
          </div>

          <OpportunitiesTable data={[]} />
        </div>
      )}
    </>
  );
}

function LoadingShell() {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-[260px] w-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
