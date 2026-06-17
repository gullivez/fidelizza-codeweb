import { AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/mock-dashboard";

type Props = {
  name: string;
  segmentLabel: string;
  segmentCount: number;
  templateName: string;
  hadConsentWarning: boolean;
};

export function StepReview({
  name,
  segmentLabel,
  segmentCount,
  templateName,
  hadConsentWarning,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Revisão</h2>
        <p className="mt-1 text-sm text-muted-foreground">Confira antes de disparar.</p>
      </div>

      <dl className="rounded-lg border border-border bg-card divide-y divide-border">
        <Row label="Nome">{name || "—"}</Row>
        <Row label="Segmento">
          <span>
            {segmentLabel} ·{" "}
            <span className="tabular-nums text-muted-foreground">
              {formatNumber(segmentCount)} clientes
            </span>
          </span>
          <p className="mt-1 text-xs text-muted-foreground">
            Alcance estimado — pode incluir clientes sem WhatsApp habilitado.
          </p>
        </Row>
        <Row label="Template">{templateName || "—"}</Row>
      </dl>

      {hadConsentWarning ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-900">
            Nenhum cliente deste segmento aceitou receber mensagens WhatsApp. O disparo pode não
            alcançar ninguém.
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}
