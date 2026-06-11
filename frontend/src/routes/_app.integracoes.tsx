import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { ProviderRow } from "@/components/integrations/ProviderRow";
import { ConnectionDialog } from "@/components/integrations/ConnectionDialog";
import { IngestionHealthCard } from "@/components/integrations/IngestionHealthCard";
import { FirstConnectionEmpty } from "@/components/integrations/FirstConnectionEmpty";
import {
  INITIAL_CONNECTIONS,
  PROVIDERS,
  type Connection,
  type Provider,
  type ProviderId,
} from "@/lib/mock-integrations";

const searchSchema = z.object({
  demo: z.enum(["error", "syncing"]).optional(),
});

export const Route = createFileRoute("/_app/integracoes")({
  head: () => ({ meta: [{ title: "Integrações — Fidelizza" }] }),
  validateSearch: searchSchema,
  component: IntegracoesPage,
});

function IntegracoesPage() {
  const { demo } = Route.useSearch();

  const initial = useMemo<Record<ProviderId, Connection>>(() => {
    const base = { ...INITIAL_CONNECTIONS };
    if (demo === "error") {
      base["cardapio-web"] = { status: "error", error: "token inválido" };
    } else if (demo === "syncing") {
      base["cardapio-web"] = { status: "syncing", progress: 64 };
    }
    return base;
  }, [demo]);

  const [connections, setConnections] = useState(initial);
  const [dialogProvider, setDialogProvider] = useState<Provider | null>(null);

  const anyActive = Object.values(connections).some(
    (c) => c.status === "active" || c.status === "syncing",
  );

  const startSync = (id: ProviderId) => {
    setConnections((prev) => ({
      ...prev,
      [id]: { status: "syncing", progress: 20 },
    }));
    setTimeout(() => {
      setConnections((prev) => ({
        ...prev,
        [id]: { status: "syncing", progress: 70 },
      }));
    }, 700);
    setTimeout(() => {
      setConnections((prev) => ({
        ...prev,
        [id]: {
          status: "active",
          lastSyncMinutesAgo: 0,
          customers: 420,
          orders: 1180,
        },
      }));
    }, 1600);
  };

  return (
    <>
      <PageHeader
        title="Integrações"
        subtitle="Conecte a fonte de dados do seu restaurante."
      />

      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {!anyActive && <FirstConnectionEmpty />}

        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Disponíveis
          </h2>
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {PROVIDERS.map((p) => (
              <ProviderRow
                key={p.id}
                provider={p}
                connection={connections[p.id]}
                onConnect={() => setDialogProvider(p)}
                onReconnect={() => setDialogProvider(p)}
                onReconfigure={() => setDialogProvider(p)}
              />
            ))}
          </div>
        </section>

        {anyActive && <IngestionHealthCard />}
      </div>

      <ConnectionDialog
        provider={dialogProvider}
        open={!!dialogProvider}
        onOpenChange={(o) => !o && setDialogProvider(null)}
        onConnect={() => {
          if (dialogProvider) startSync(dialogProvider.id);
        }}
      />
    </>
  );
}
