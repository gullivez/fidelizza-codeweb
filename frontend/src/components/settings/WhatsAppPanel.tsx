import { CheckCircle2, AlertTriangle, Smartphone } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useLayout } from "@/lib/layout-context";
import { WHATSAPP } from "@/lib/mock-settings";

export function WhatsAppPanel() {
  const { whatsappConnected } = useLayout();

  // Mock health: healthy when connected, disconnected otherwise
  const health = whatsappConnected ? WHATSAPP.health : "disconnected";

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-base font-semibold text-foreground">WhatsApp</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Número usado para enviar suas campanhas.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <StatusBadge variant={whatsappConnected ? "success" : "danger"}>
              {whatsappConnected ? "Conectado" : "Desconectado"}
            </StatusBadge>
            <div className="mt-3 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              {WHATSAPP.numero}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-sm">
              {health === "healthy" && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700">Número saudável</span>
                </>
              )}
              {health === "warming" && (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-amber-700">Em aquecimento</span>
                </>
              )}
              {health === "disconnected" && (
                <>
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span className="text-rose-700">Desconectado</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <p className="rounded-md bg-zinc-50 p-3 text-xs text-muted-foreground">
        Este é o número usado para enviar suas campanhas. Se ele cair, as campanhas são pausadas
        automaticamente.
      </p>
    </div>
  );
}
