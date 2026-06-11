import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Smartphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useLayout } from "@/lib/layout-context";
import { WHATSAPP } from "@/lib/mock-settings";
import { cn } from "@/lib/utils";

function QRCodePlaceholder() {
  // Deterministic pseudo-random grid
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21;
    const y = Math.floor(i / 21);
    const corner =
      (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    const hash = (x * 31 + y * 17 + x * y) % 7;
    return corner ? null : hash < 3;
  });
  return (
    <div className="grid h-48 w-48 grid-cols-21 gap-px rounded-md bg-white p-2 ring-1 ring-zinc-200" style={{ gridTemplateColumns: "repeat(21, minmax(0,1fr))" }}>
      {cells.map((on, i) => (
        <div key={i} className={cn("aspect-square", on ? "bg-zinc-900" : "bg-white")} />
      ))}
      {/* finder squares overlay */}
      <div className="pointer-events-none col-span-21 -mt-[100%] flex items-start justify-between">
        <div className="h-12 w-12 border-[6px] border-zinc-900" />
        <div className="h-12 w-12 border-[6px] border-zinc-900" />
      </div>
    </div>
  );
}

export function WhatsAppPanel() {
  const { whatsappConnected, setWhatsappConnected } = useLayout();
  const [busy, setBusy] = useState(false);

  // Mock health: healthy when connected, disconnected otherwise
  const health = whatsappConnected ? WHATSAPP.health : "disconnected";

  const reconnect = () => {
    setBusy(true);
    setTimeout(() => {
      setWhatsappConnected(true);
      setBusy(false);
    }, 900);
  };

  const disconnect = () => {
    setWhatsappConnected(false);
  };

  useEffect(() => {
    // keep in sync if reopened — noop
  }, []);

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
          {whatsappConnected && (
            <Button variant="outline" size="sm" onClick={disconnect}>
              Desconectar
            </Button>
          )}
        </div>
      </section>

      {!whatsappConnected && (
        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Reconectar WhatsApp
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Escaneie o QR Code abaixo no aparelho do número.
          </p>
          <div className="mt-4 flex flex-col items-start gap-6 md:flex-row">
            <QRCodePlaceholder />
            <ol className="flex-1 space-y-2 text-sm text-foreground">
              <li><span className="font-medium">1.</span> Abra o WhatsApp no celular do número.</li>
              <li><span className="font-medium">2.</span> Vá em <em>Configurações → Aparelhos conectados</em>.</li>
              <li><span className="font-medium">3.</span> Toque em <em>Conectar um aparelho</em> e aponte para o QR Code.</li>
              <li className="pt-2">
                <Button onClick={reconnect} className="bg-indigo-600 hover:bg-indigo-700" disabled={busy}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Já escaneei
                </Button>
              </li>
            </ol>
          </div>
        </section>
      )}

      <p className="rounded-md bg-zinc-50 p-3 text-xs text-muted-foreground">
        Este é o número usado para enviar suas campanhas. Se ele cair, as
        campanhas são pausadas automaticamente.
      </p>
    </div>
  );
}
