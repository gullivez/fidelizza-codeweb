import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, RefreshCw, Clock, Plug } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLayout } from "@/lib/layout-context";
import { integrationsApi } from "@/lib/api/integrations";
import type { ApiIntegration } from "@/lib/api/integrations";

export const Route = createFileRoute("/_app/integracoes")({
  head: () => ({ meta: [{ title: "Integrações — Fidelizza" }] }),
  component: IntegracoesPage,
});

function IntegracoesPage() {
  const { activeRestaurant } = useLayout();
  const rid = activeRestaurant?.id ?? "";
  const queryClient = useQueryClient();

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["integrations", rid],
    queryFn: () => integrationsApi.list(rid),
    enabled: !!rid,
  });

  const integration: ApiIntegration | undefined = integrations[0];

  const syncMutation = useMutation({
    mutationFn: () => integrationsApi.syncNow(rid, integration!.id),
    onSuccess: () => {
      toast.success("Sincronização iniciada com sucesso!");
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["integrations", rid] }), 3000);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Falha ao iniciar sincronização"),
  });

  if (isLoading) {
    return (
      <>
        <PageHeader title="Integrações" subtitle="Conecte a fonte de dados do seu restaurante." />
        <div className="mx-auto max-w-2xl animate-pulse space-y-4">
          <div className="h-32 rounded-lg bg-muted" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Integrações" subtitle="Conecte a fonte de dados do seu restaurante." />
      <div className="mx-auto max-w-2xl space-y-6">
        {!integration ? (
          <ConnectForm restaurantId={rid} onSuccess={() => queryClient.invalidateQueries({ queryKey: ["integrations", rid] })} />
        ) : (
          <IntegrationCard
            integration={integration}
            onSync={() => syncMutation.mutate()}
            syncing={syncMutation.isPending}
          />
        )}
      </div>
    </>
  );
}

// ── Connect form ─────────────────────────────────────────────────────────────

function ConnectForm({ restaurantId, onSuccess }: { restaurantId: string; onSuccess: () => void }) {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [syncTime1, setSyncTime1] = useState("03:00");

  const createMutation = useMutation({
    mutationFn: () =>
      integrationsApi.create(restaurantId, {
        provider: "anota_ai",
        clientId,
        clientSecret,
        syncTime1,
      }),
    onSuccess: () => {
      toast.success("Integração criada com sucesso!");
      onSuccess();
    },
    onError: () => toast.error("Falha ao criar integração. Verifique as credenciais."),
  });

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Plug className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Conectar Anota.ai</h2>
          <p className="text-sm text-muted-foreground">Informe suas credenciais para importar pedidos</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="clientId">Client ID</Label>
          <Input
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="seu-client-id"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="clientSecret">Client Secret / Token</Label>
          <Input
            id="clientSecret"
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="seu-token"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="syncTime">Horário de sync diário (UTC)</Label>
          <Input
            id="syncTime"
            type="time"
            value={syncTime1}
            onChange={(e) => setSyncTime1(e.target.value)}
          />
        </div>
      </div>

      <Button
        onClick={() => createMutation.mutate()}
        disabled={createMutation.isPending || !clientId || !clientSecret}
        className="w-full"
      >
        {createMutation.isPending ? "Conectando…" : "Conectar"}
      </Button>
    </div>
  );
}

// ── Integration card ──────────────────────────────────────────────────────────

function IntegrationCard({
  integration,
  onSync,
  syncing,
}: {
  integration: ApiIntegration;
  onSync: () => void;
  syncing: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);

  const statusColor =
    integration.status === "active"
      ? "text-success"
      : integration.status === "error"
        ? "text-destructive"
        : "text-muted-foreground";

  const StatusIcon =
    integration.status === "active"
      ? CheckCircle2
      : integration.status === "error"
        ? AlertTriangle
        : Clock;

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Plug className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Anota.ai</h2>
              <div className={`flex items-center gap-1.5 text-sm ${statusColor}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                <span className="capitalize">{integration.status}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Editar horário
            </Button>
            <Button size="sm" onClick={onSync} disabled={syncing}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Sincronizando…" : "Sincronizar agora"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Sync diário</div>
            <div className="font-medium">{integration.syncTime1} UTC{integration.syncTime2 ? ` · ${integration.syncTime2} UTC` : ""}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Última sync</div>
            <div className="font-medium">
              {integration.lastSyncAt
                ? formatDistanceToNow(new Date(integration.lastSyncAt), { addSuffix: true, locale: ptBR })
                : "Nunca"}
            </div>
          </div>
          {integration.lastError && (
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Último erro</div>
              <div className="text-sm text-destructive font-mono truncate">{integration.lastError}</div>
            </div>
          )}
        </div>
      </div>

      <EditScheduleDialog
        integration={integration}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

// ── Edit schedule dialog ──────────────────────────────────────────────────────

function EditScheduleDialog({
  integration,
  open,
  onOpenChange,
}: {
  integration: ApiIntegration;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [syncTime1, setSyncTime1] = useState(integration.syncTime1);
  const [syncTime2, setSyncTime2] = useState(integration.syncTime2 ?? "");
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () =>
      integrationsApi.update(integration.restaurantId, integration.id, {
        syncTime1,
        syncTime2: syncTime2 || null,
      }),
    onSuccess: () => {
      toast.success("Horário atualizado!");
      queryClient.invalidateQueries({ queryKey: ["integrations", integration.restaurantId] });
      onOpenChange(false);
    },
    onError: () => toast.error("Falha ao atualizar horário"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar horário de sincronização</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label>Sincronização 1 (UTC)</Label>
            <Input type="time" value={syncTime1} onChange={(e) => setSyncTime1(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Sincronização 2 (UTC) — opcional</Label>
            <Input
              type="time"
              value={syncTime2}
              onChange={(e) => setSyncTime2(e.target.value)}
              placeholder="Deixe em branco para desativar"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// keep unused import reference for format
void format;
