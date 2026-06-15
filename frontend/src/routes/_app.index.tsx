import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLayout } from "@/lib/layout-context";
import { dashboardByPeriod, type Period } from "@/lib/mock-dashboard";
import { PeriodToggle } from "@/components/dashboard/PeriodToggle";
import { ImpactStrip } from "@/components/dashboard/ImpactStrip";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RFMBar } from "@/components/dashboard/RFMBar";
import { CampaignFunnel } from "@/components/dashboard/CampaignFunnel";
import { OpportunitiesTable } from "@/components/dashboard/OpportunitiesTable";
import { NeverSentCTA } from "@/components/dashboard/NeverSentCTA";
import { DashboardEmptyImporting } from "@/components/dashboard/DashboardEmptyImporting";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Fidelizza" },
      { name: "description", content: "Prova de ROI da reativação de clientes em tempo real." },
    ],
  }),
  component: DashboardPage,
});

type ViewState = "populated" | "loading" | "importing" | "never-sent";

function DashboardPage() {
  const { activeRestaurant } = useLayout();
  const [period, setPeriod] = useState<Period>("30d");
  // QA toggle (default populated). Change to "loading" / "importing" / "never-sent" to preview.
  const [viewState] = useState<ViewState>("populated");
  const data = dashboardByPeriod[period];

  const actions = (
    <>
      <PeriodToggle value={period} onChange={setPeriod} />
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Plus className="h-4 w-4" />
        Nova campanha
      </Button>
    </>
  );

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={activeRestaurant?.name ?? ""}
        action={actions}
      />

      {viewState === "importing" ? (
        <DashboardEmptyImporting progress={42} />
      ) : viewState === "loading" ? (
        <LoadingShell />
      ) : (
        <div className="space-y-5">
          {viewState === "never-sent" ? (
            <NeverSentCTA inactiveCount={data.rfm.inactive} />
          ) : (
            <ImpactStrip data={data.kpis} />
          )}

          <RevenueChart data={data.revenueSeries} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <RFMBar data={data.rfm} />
            <CampaignFunnel data={data.lastCampaign} />
          </div>

          <OpportunitiesTable data={data.opportunities} />
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
