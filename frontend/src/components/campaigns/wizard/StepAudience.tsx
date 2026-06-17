import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber } from "@/lib/mock-dashboard";
import type { ApiSegmentStat } from "@/lib/api/segments";

type Props = {
  name: string;
  onNameChange: (v: string) => void;
  segments: ApiSegmentStat[];
  segmentsLoading: boolean;
  segmentName: string | null;
  onSegmentChange: (name: string) => void;
};

export function StepAudience({
  name,
  onNameChange,
  segments,
  segmentsLoading,
  segmentName,
  onSegmentChange,
}: Props) {
  const selected = segments.find((s) => s.name === segmentName) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Nome e público da campanha</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dê um nome à campanha e escolha o segmento da sua base.
        </p>
      </div>

      <div className="max-w-md">
        <Label htmlFor="campaign-name" className="text-sm">
          Nome da campanha
        </Label>
        <Input
          id="campaign-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ex: Reativação de inativos"
          className="mt-1.5 h-9"
        />
      </div>

      {segmentsLoading ? (
        <div className="text-sm text-muted-foreground">Carregando segmentos...</div>
      ) : (
        <div role="radiogroup" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {segments.map((s) => {
            const active = s.name === segmentName;
            return (
              <button
                key={s.name}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSegmentChange(s.name)}
                className={cn(
                  "text-left rounded-lg border p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  active
                    ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                    : "border-border bg-card hover:border-zinc-300",
                )}
              >
                <div className="text-sm font-medium text-foreground">{s.label}</div>
                <div className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                  {formatNumber(s.count)}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected ? (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <div className="text-sm font-medium text-indigo-900">
            Esse segmento tem <span className="tabular-nums">{formatNumber(selected.count)}</span>{" "}
            clientes
          </div>
        </div>
      ) : null}
    </div>
  );
}
