import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FailedAlert({ motivo }: { motivo?: string }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertCircle className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-rose-900">A campanha falhou</div>
        <p className="mt-1 text-sm text-rose-800/90">
          {motivo ?? "Ocorreu um erro durante o envio."}
        </p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link to="/configuracoes">Ir para Configurações</Link>
      </Button>
    </div>
  );
}
