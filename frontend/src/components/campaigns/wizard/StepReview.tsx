import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  estimateMinutes,
  getSegment,
  renderPreview,
  type SegmentOption,
  type SendOption,
} from "@/lib/campaign-wizard";
import { formatNumber } from "@/lib/mock-dashboard";

type Props = {
  segmentoId: SegmentOption["id"] | null;
  mensagem: string;
  janelaDias: number;
  sendOption: SendOption;
  scheduledAt: Date | null;
  onSendOptionChange: (v: SendOption) => void;
  onScheduledAtChange: (d: Date | null) => void;
};

export function StepReview({
  segmentoId,
  mensagem,
  janelaDias,
  sendOption,
  scheduledAt,
  onSendOptionChange,
  onScheduledAtChange,
}: Props) {
  const segment = getSegment(segmentoId);
  const reach = segment ? segment.count - segment.optOut : 0;
  const minutes = estimateMinutes(reach);

  const dateLabel = scheduledAt
    ? scheduledAt.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Escolher data";

  const timeValue = scheduledAt
    ? `${String(scheduledAt.getHours()).padStart(2, "0")}:${String(scheduledAt.getMinutes()).padStart(2, "0")}`
    : "09:00";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Revisão</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confira antes de disparar.
        </p>
      </div>

      <dl className="rounded-lg border border-border bg-card divide-y divide-border">
        <Row label="Segmento">
          {segment ? (
            <span>
              {segment.nome} ·{" "}
              <span className="tabular-nums text-muted-foreground">
                {formatNumber(reach)} clientes
              </span>
            </span>
          ) : (
            "—"
          )}
        </Row>
        <Row label="Janela de atribuição">{janelaDias} dias</Row>
        <Row label="Mensagem">
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {mensagem ? renderPreview(mensagem) : "—"}
          </p>
        </Row>
      </dl>

      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
        <div className="text-sm text-indigo-900">
          ⏱️ O envio para{" "}
          <span className="font-semibold tabular-nums">{formatNumber(reach)}</span>{" "}
          clientes levará{" "}
          <span className="font-semibold tabular-nums">~{minutes} min</span>.
        </div>
        <div className="mt-1 text-xs text-indigo-800/80">
          Enviamos gradualmente para proteger seu número de WhatsApp contra bloqueios.
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm">Quando enviar</Label>
        <RadioGroup
          value={sendOption}
          onValueChange={(v) => onSendOptionChange(v as SendOption)}
          className="grid gap-2 sm:grid-cols-2"
        >
          <OptionCard value="now" current={sendOption} title="Enviar agora" />
          <OptionCard value="scheduled" current={sendOption} title="Agendar" />
        </RadioGroup>

        {sendOption === "scheduled" ? (
          <div className="flex flex-wrap items-end gap-3 pt-2">
            <div>
              <Label className="text-xs text-muted-foreground">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "mt-1 w-[220px] justify-start text-left font-normal h-9",
                      !scheduledAt && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {dateLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledAt ?? undefined}
                    onSelect={(d) => {
                      if (!d) return onScheduledAtChange(null);
                      const next = new Date(d);
                      if (scheduledAt) {
                        next.setHours(scheduledAt.getHours());
                        next.setMinutes(scheduledAt.getMinutes());
                      } else {
                        next.setHours(9, 0, 0, 0);
                      }
                      onScheduledAtChange(next);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Hora</Label>
              <div className="mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={timeValue}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(":").map(Number);
                    const base = scheduledAt ? new Date(scheduledAt) : new Date();
                    base.setHours(h || 0, m || 0, 0, 0);
                    onScheduledAtChange(base);
                  }}
                  className="w-28 h-9"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
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

function OptionCard({
  value,
  current,
  title,
}: {
  value: SendOption;
  current: SendOption;
  title: string;
}) {
  const active = value === current;
  return (
    <label
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
        active
          ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
          : "border-border bg-card hover:border-zinc-300",
      )}
    >
      <RadioGroupItem value={value} />
      <span className="text-sm font-medium text-foreground">{title}</span>
    </label>
  );
}
