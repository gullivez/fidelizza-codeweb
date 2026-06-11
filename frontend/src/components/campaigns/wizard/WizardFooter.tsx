import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import type { WizardStep } from "@/lib/campaign-wizard";

type Props = {
  step: WizardStep;
  canContinue: boolean;
  onBack: () => void;
  onNext: () => void;
};

export function WizardFooter({ step, canContinue, onBack, onNext }: Props) {
  const isLast = step === 3;
  return (
    <div className="sticky bottom-0 mt-8 -mx-6 px-6 py-3 border-t border-border bg-background/80 backdrop-blur flex items-center justify-between">
      <Button variant="ghost" onClick={onBack} disabled={step === 1}>
        Voltar
      </Button>
      <Button
        onClick={onNext}
        disabled={!canContinue}
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
    </div>
  );
}
