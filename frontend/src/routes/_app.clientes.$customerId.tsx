import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { UserX } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { CustomerKpiStrip } from "@/components/customer/CustomerKpiStrip";
import { RFMIndicator } from "@/components/customer/RFMIndicator";
import { CustomerTimeline } from "@/components/customer/CustomerTimeline";
import { CustomerDetailsCard } from "@/components/customer/CustomerDetailsCard";
import { CustomerDetailSkeleton } from "@/components/customer/CustomerDetailSkeleton";
import {
  getCustomerDetail,
  getCustomerKPIs,
  getCustomerRFM,
  getCustomerTimeline,
} from "@/lib/mock-customer-detail";

export const Route = createFileRoute("/_app/clientes/$customerId")({
  head: () => ({ meta: [{ title: "Cliente — Fidelizza" }] }),
  component: CustomerDetailPage,
});

type ViewState = "populated" | "loading";

function CustomerDetailPage() {
  const { customerId } = Route.useParams();
  const [viewState] = useState<ViewState>("populated");
  const customer = getCustomerDetail(customerId);

  if (viewState === "loading") return <CustomerDetailSkeleton />;

  if (!customer) {
    return (
      <EmptyState
        icon={UserX}
        title="Cliente não encontrado"
        description="O cliente que você tentou abrir não existe ou foi removido."
        action={
          <Button asChild>
            <Link to="/clientes" search={{ segmento: "todos", q: "", page: 1 }}>
              Voltar para clientes
            </Link>
          </Button>
        }
      />
    );
  }

  const kpis = getCustomerKPIs(customer);
  const rfm = getCustomerRFM(customer);
  const timeline = getCustomerTimeline(customer);

  return (
    <>
      <CustomerHeader customer={customer} />
      <CustomerKpiStrip {...kpis} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6 min-w-0">
          <RFMIndicator score={rfm} />
          <CustomerTimeline events={timeline} />
        </div>
        <aside className="space-y-6">
          <CustomerDetailsCard customer={customer} />
        </aside>
      </div>
    </>
  );
}
