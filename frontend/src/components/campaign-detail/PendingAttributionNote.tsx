import { Clock } from "lucide-react";
import { formatLongDate } from "@/lib/mock-campaign-detail";

export function PendingAttributionNote({ janelaFim }: { janelaFim: string }) {
  return (
    <div className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 flex items-center gap-2 text-xs text-indigo-900">
      <Clock className="h-3.5 w-3.5" />
      Janela de atribuição aberta até{" "}
      <span className="font-medium">{formatLongDate(janelaFim)}</span>. Os pedidos
      ainda podem entrar.
    </div>
  );
}
