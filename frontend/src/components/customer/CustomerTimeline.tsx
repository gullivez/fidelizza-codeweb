import {
  CheckCircle2,
  RefreshCw,
  Send,
  ShoppingCart,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/mock-customer-detail";

type Visual = {
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

const visuals: Record<TimelineEvent["type"], Visual> = {
  order: { Icon: ShoppingCart, iconBg: "bg-zinc-100", iconColor: "text-zinc-700" },
  message: { Icon: Send, iconBg: "bg-indigo-100", iconColor: "text-indigo-700" },
  conversion: { Icon: CheckCircle2, iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
  segment: { Icon: RefreshCw, iconBg: "bg-amber-100", iconColor: "text-amber-700" },
  signup: { Icon: UserPlus, iconBg: "bg-zinc-100", iconColor: "text-zinc-700" },
};

export function CustomerTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Atividade</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {events.length} {events.length === 1 ? "evento" : "eventos"}
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
        <ul className="space-y-4">
          {events.map((ev) => {
            const v = visuals[ev.type];
            const isConv = ev.type === "conversion";
            return (
              <li key={ev.id} className="relative flex gap-3">
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full shrink-0 ring-4 ring-card",
                    v.iconBg,
                  )}
                >
                  <v.Icon className={cn("h-4 w-4", v.iconColor)} />
                </div>
                <div
                  className={cn(
                    "flex-1 min-w-0 rounded-md border px-3 py-2",
                    isConv
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-transparent",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div
                        className={cn(
                          "text-sm font-medium truncate",
                          isConv ? "text-emerald-900" : "text-foreground",
                        )}
                      >
                        {ev.title}
                      </div>
                      <div
                        className={cn(
                          "text-xs mt-0.5 leading-snug",
                          isConv ? "text-emerald-800/80" : "text-muted-foreground",
                        )}
                      >
                        {ev.subtitle}
                      </div>
                    </div>
                    <time
                      className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap shrink-0"
                      title={format(new Date(ev.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    >
                      {formatDistanceToNow(new Date(ev.date), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </time>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
