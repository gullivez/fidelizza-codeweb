import { Plug } from "lucide-react";

export function FirstConnectionEmpty() {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-indigo-200 bg-indigo-50/60 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white">
        <Plug className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-indigo-950">
          Conecte sua primeira fonte de dados para começar
        </h3>
        <p className="mt-1 text-sm text-indigo-900/70">
          Importamos seus clientes e pedidos automaticamente — sem CRM, sem
          campanhas. Escolha um provedor disponível abaixo.
        </p>
      </div>
    </div>
  );
}
