import { BellOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function OptOutIcon() {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center text-zinc-400">
            <BellOff className="h-3.5 w-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Não recebe campanhas (opt-out)
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
