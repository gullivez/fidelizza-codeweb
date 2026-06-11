import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { segmentLabels, type Segment } from "@/lib/mock-customers";

type Props = {
  segment: Segment;
  count: number;
};

export function ContextualActionBar({ segment, count }: Props) {
  if (segment === "todos") return null;
  const label = segmentLabels[segment as Exclude<Segment, "todos">];

  return (
    <div className="sticky bottom-0 -mx-6 mt-6 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)]">
      <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="text-sm text-foreground">
          <span className="num tabular-nums font-semibold">{count.toLocaleString("pt-BR")}</span>{" "}
          clientes em{" "}
          <span className="font-medium">"{label}"</span>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link to="/campanhas" search={{ segmento: segment } as never}>
            Criar campanha para estes clientes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
