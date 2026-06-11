import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { inactiveCount: number; onStart?: () => void };

export function NeverSentCTA({ inactiveCount, onStart }: Props) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-emerald-950">
            Você tem <span className="num tabular-nums">{inactiveCount}</span> clientes inativos.
          </h2>
          <p className="mt-1 text-sm text-emerald-900/80">
            Recupere-os agora com uma campanha de reativação em 2 minutos.
          </p>
        </div>
        <Button
          onClick={onStart}
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Recuperar agora
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
