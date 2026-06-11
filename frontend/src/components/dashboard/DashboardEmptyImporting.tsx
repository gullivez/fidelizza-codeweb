import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function DashboardEmptyImporting({ progress = 42 }: { progress?: number }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-col items-center justify-center text-center py-20 px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Estamos importando seus pedidos
        </h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md">
          Isso leva alguns minutos. Você pode fechar esta tela — avisaremos quando terminar.
        </p>
        <div className="mt-6 w-full max-w-sm">
          <Progress value={progress} className="h-1.5" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>Sincronizando pedidos</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
