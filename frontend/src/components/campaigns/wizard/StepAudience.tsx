import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SEGMENTS, getSegment, type SegmentOption } from "@/lib/campaign-wizard";
import { formatNumber } from "@/lib/mock-dashboard";

type Props = {
  segmentoId: SegmentOption["id"] | null;
  janelaDias: number;
  onSegmentChange: (id: SegmentOption["id"]) => void;
  onJanelaChange: (n: number) => void;
};

export function StepAudience({
  segmentoId,
  janelaDias,
  onSegmentChange,
  onJanelaChange,
}: Props) {
  const selected = getSegment(segmentoId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Para quem você quer enviar?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha o segmento da sua base.
        </p>
      </div>

      <div role="radiogroup" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SEGMENTS.map((s) => {
          const active = s.id === segmentoId;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSegmentChange(s.id)}
              className={cn(
                "text-left rounded-lg border p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                active
                  ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                  : "border-border bg-card hover:border-zinc-300",
              )}
            >
              <div className="text-sm font-medium text-foreground">{s.nome}</div>
              <div className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                {formatNumber(s.count)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.description}</div>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <div className="text-sm font-medium text-indigo-900">
            Você vai alcançar{" "}
            <span className="tabular-nums">
              {formatNumber(selected.count - selected.optOut)}
            </span>{" "}
            clientes
          </div>
          <div className="mt-1 text-xs text-indigo-800/80">
            {formatNumber(selected.optOut)} excluídos por opt-out de WhatsApp
          </div>
        </div>
      ) : null}

      <div className="flex items-end gap-3 max-w-md">
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="janela" className="text-sm">
              Janela de atribuição
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Pedidos feitos em até {janelaDias} dias após a mensagem contam como
                  conversão desta campanha.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <Input
              id="janela"
              type="number"
              min={1}
              max={30}
              value={janelaDias}
              onChange={(e) => onJanelaChange(Math.max(1, Number(e.target.value) || 1))}
              className="w-24 h-9"
            />
            <span className="text-sm text-muted-foreground">dias</span>
          </div>
        </div>
      </div>
    </div>
  );
}
