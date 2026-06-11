import { AlertTriangle, ArrowRight } from "lucide-react";
import { useLayout } from "@/lib/layout-context";

export function WhatsAppAlertBanner() {
  const { whatsappConnected } = useLayout();
  if (whatsappConnected) return null;

  return (
    <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50 px-6 py-2 text-sm text-rose-900">
      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
      <span className="flex-1">
        <strong className="font-semibold">Seu WhatsApp está desconectado.</strong>{" "}
        Campanhas estão pausadas.
      </span>
      <button className="inline-flex items-center gap-1 font-medium text-rose-700 hover:text-rose-900 transition-colors">
        Reconectar
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
