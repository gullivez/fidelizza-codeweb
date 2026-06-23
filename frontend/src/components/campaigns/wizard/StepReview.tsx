import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/mock-dashboard";
import { campaignsApi, type TemplateVariableMap } from "@/lib/api/campaigns";
import { ScheduleToggle, type DispatchMode } from "@/components/campaigns/ScheduleToggle";

type Props = {
  restaurantId: string;
  name: string;
  segmentLabel: string;
  segmentCount: number;
  templateName: string;
  attributionWindowDays: number;
  templateVariables: TemplateVariableMap;
  hadConsentWarning: boolean;
  dispatchMode: DispatchMode;
  onDispatchModeChange: (mode: DispatchMode) => void;
  scheduledAtLocal: string;
  onScheduledAtLocalChange: (value: string) => void;
};

export function StepReview({
  restaurantId,
  name,
  segmentLabel,
  segmentCount,
  templateName,
  attributionWindowDays,
  templateVariables,
  hadConsentWarning,
  dispatchMode,
  onDispatchModeChange,
  scheduledAtLocal,
  onScheduledAtLocalChange,
}: Props) {
  const variablesQuery = useQuery({
    queryKey: ["variables", restaurantId],
    queryFn: () => campaignsApi.listVariables(restaurantId),
    enabled: !!restaurantId,
  });
  const variables = variablesQuery.data ?? [];

  const variableRows = Object.entries(templateVariables)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([position, entry]) => {
      if (entry.type === "dynamic") {
        const label = variables.find((v) => v.key === entry.key)?.label ?? entry.key;
        return `Variável ${position}: ${label} (automático)`;
      }
      return `Variável ${position}: ${entry.value || "—"} (fixo)`;
    });

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
        <Row label="Janela de atribuição">{attributionWindowDays} dias</Row>
        {variableRows.length > 0 ? (
          <Row label="Variáveis">
            <ul className="flex flex-col gap-1">
              {variableRows.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ul>
          </Row>
        ) : null}
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

      <ScheduleToggle
        dispatchMode={dispatchMode}
        onDispatchModeChange={onDispatchModeChange}
        scheduledAtLocal={scheduledAtLocal}
        onScheduledAtLocalChange={onScheduledAtLocalChange}
      />
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
