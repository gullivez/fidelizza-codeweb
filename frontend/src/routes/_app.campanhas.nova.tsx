import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/campaigns/wizard/Stepper";
import { WizardFooter } from "@/components/campaigns/wizard/WizardFooter";
import { StepAudience } from "@/components/campaigns/wizard/StepAudience";
import { StepMessage } from "@/components/campaigns/wizard/StepMessage";
import { StepReview } from "@/components/campaigns/wizard/StepReview";
import {
  ConfirmDispatchDialog,
  WhatsAppDisconnectedDialog,
} from "@/components/campaigns/wizard/DispatchDialogs";
import {
  INITIAL_STATE,
  getSegment,
  type WizardState,
  type WizardStep,
} from "@/lib/campaign-wizard";

type Search = { wa?: "off" };

export const Route = createFileRoute("/_app/campanhas/nova")({
  head: () => ({ meta: [{ title: "Nova Campanha — Fidelizza" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    wa: s.wa === "off" ? "off" : undefined,
  }),
  component: NovaCampanhaPage,
});

function NovaCampanhaPage() {
  const { wa } = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [waErrorOpen, setWaErrorOpen] = useState(false);

  const segment = getSegment(state.segmentoId);
  const reach = segment ? segment.count - segment.optOut : 0;

  const canContinue = useMemo(() => {
    if (step === 1) return state.segmentoId !== null;
    if (step === 2) return state.mensagem.trim().length >= 10;
    if (step === 3) {
      if (state.sendOption === "scheduled") return state.scheduledAt !== null;
      return true;
    }
    return false;
  }, [step, state]);

  const update = <K extends keyof WizardState>(k: K, v: WizardState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const handleNext = () => {
    if (step < 3) {
      setStep((s) => (s + 1) as WizardStep);
      return;
    }
    if (wa === "off") {
      setWaErrorOpen(true);
      return;
    }
    setConfirmOpen(true);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as WizardStep);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    navigate({ to: "/campanhas/$campaignId", params: { campaignId: "c-003" } });
  };

  const containerMaxW = step === 2 ? "max-w-6xl" : "max-w-3xl";

  return (
    <>
      <PageHeader
        title="Nova Campanha"
        subtitle="Configure e dispare em 3 passos"
        action={
          <Button variant="ghost" asChild>
            <Link to="/campanhas">Cancelar</Link>
          </Button>
        }
      />

      <div className={`mx-auto w-full ${containerMaxW}`}>
        <div className="mb-8">
          <Stepper current={step} />
        </div>

        {step === 1 && (
          <StepAudience
            segmentoId={state.segmentoId}
            janelaDias={state.janelaDias}
            onSegmentChange={(id) => update("segmentoId", id)}
            onJanelaChange={(n) => update("janelaDias", n)}
          />
        )}
        {step === 2 && (
          <StepMessage
            mensagem={state.mensagem}
            onChange={(v) => update("mensagem", v)}
          />
        )}
        {step === 3 && (
          <StepReview
            segmentoId={state.segmentoId}
            mensagem={state.mensagem}
            janelaDias={state.janelaDias}
            sendOption={state.sendOption}
            scheduledAt={state.scheduledAt}
            onSendOptionChange={(v) => update("sendOption", v)}
            onScheduledAtChange={(d) => update("scheduledAt", d)}
          />
        )}

        <WizardFooter
          step={step}
          canContinue={canContinue}
          onBack={handleBack}
          onNext={handleNext}
        />
      </div>

      <ConfirmDispatchDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        count={reach}
        onConfirm={handleConfirm}
      />
      <WhatsAppDisconnectedDialog
        open={waErrorOpen}
        onOpenChange={setWaErrorOpen}
      />
    </>
  );
}
