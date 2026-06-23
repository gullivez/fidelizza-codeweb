import { useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import {
  ALL_TABS,
  SettingsNav,
  type TabId,
} from "@/components/settings/SettingsNav";
import { WhatsAppPanel } from "@/components/settings/WhatsAppPanel";
import { ContaPanel } from "@/components/settings/ContaPanel";
import { UsuariosPanel } from "@/components/settings/UsuariosPanel";
import { RestaurantesPanel } from "@/components/settings/RestaurantesPanel";
import { PreferenciasPanel } from "@/components/settings/PreferenciasPanel";
import { CURRENT_USER, type Role, type BillingStatus } from "@/lib/mock-settings";
import { useLayout } from "@/lib/layout-context";

const searchSchema = z.object({
  tab: z.enum(["whatsapp", "conta", "usuarios", "restaurantes", "preferencias"]).optional(),
  role: z.enum(["owner", "admin", "operator"]).optional(),
  wa: z.enum(["on", "off"]).optional(),
  billing: z.enum(["active", "past_due", "canceled"]).optional(),
});

export const Route = createFileRoute("/_app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Fidelizza" }] }),
  validateSearch: searchSchema,
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/configuracoes" });
  const { whatsappConnected, setWhatsappConnected } = useLayout();

  const role: Role = (search.role as Role) ?? CURRENT_USER.role;
  const billing: BillingStatus | undefined = search.billing;

  // Sync ?wa=off with global layout state for the WhatsApp banner
  useEffect(() => {
    if (search.wa === "off" && whatsappConnected) setWhatsappConnected(false);
    if (search.wa === "on" && !whatsappConnected) setWhatsappConnected(true);
  }, [search.wa, whatsappConnected, setWhatsappConnected]);

  const visibleTabs = useMemo(() => {
    return ALL_TABS.filter((t) => {
      if (role === "operator" && (t.id === "conta" || t.id === "restaurantes")) return false;
      // TODO: Sprint pós-MVP — reativar quando tela de restaurantes for implementada
      if (t.id === "restaurantes") return false;
      return true;
    });
  }, [role]);

  const requestedTab = (search.tab ?? "whatsapp") as TabId;
  const activeTab: TabId = visibleTabs.some((t) => t.id === requestedTab)
    ? requestedTab
    : "whatsapp";

  // Redirect if user landed on a forbidden tab
  useEffect(() => {
    if (search.tab && search.tab !== activeTab) {
      navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, tab: activeTab }), replace: true });
    }
  }, [search.tab, activeTab, navigate]);

  return (
    <>
      <PageHeader
        title="Configurações"
        subtitle="Preferências da conta e do restaurante."
      />

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="md:sticky md:top-4 md:self-start">
          <SettingsNav
            tabs={visibleTabs}
            active={activeTab}
            whatsappDisconnected={!whatsappConnected}
          />
        </aside>

        <div className="min-w-0">
          {activeTab === "whatsapp" && <WhatsAppPanel />}
          {activeTab === "conta" && <ContaPanel billingOverride={billing} />}
          {activeTab === "usuarios" && <UsuariosPanel />}
          {activeTab === "restaurantes" && <RestaurantesPanel />}
          {activeTab === "preferencias" && <PreferenciasPanel />}
        </div>
      </div>
    </>
  );
}
