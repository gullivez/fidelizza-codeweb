import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { WizardStep } from "./Stepper";

type Props = {
  step: WizardStep;
  canContinue: boolean;
  loading?: boolean;
  disabledReason?: string;
  onBack: () => void;
  onNext: () => void;
};

export function WizardFooter({
  step,
  canContinue,
  loading,
  disabledReason,
  onBack,
  onNext,
}: Props) {
  const isLast = step === 3;
  const isDisabled = !canContinue || loading;

  const nextButton = (
    <Button
      onClick={onNext}
      disabled={isDisabled}
      className="bg-indigo-600 hover:bg-indigo-700 text-white"
    >
      {isLast ? (
        <>
          <Send className="h-4 w-4" />
          Disparar campanha
        </>
      ) : (
        "Continuar"
      )}
    </Button>
  );

  return (
    <div className="sticky bottom-0 mt-8 -mx-6 px-6 py-3 border-t border-border bg-background/80 backdrop-blur flex items-center justify-between">
      <Button variant="ghost" onClick={onBack} disabled={step === 1}>
        Voltar
      </Button>
      {isDisabled && disabledReason ? (
        <TooltipProvider>
          <Tooltip>
            {/* Radix não dispara hover em <button disabled> — o span é o gatilho real. */}
            <TooltipTrigger asChild>
              <span tabIndex={-1}>{nextButton}</span>
            </TooltipTrigger>
            <TooltipContent>{disabledReason}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        nextButton
      )}
    </div>
  );
}
