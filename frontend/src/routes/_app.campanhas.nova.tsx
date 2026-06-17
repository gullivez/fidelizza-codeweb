import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Stepper, type WizardStep } from "@/components/campaigns/wizard/Stepper";
import { WizardFooter } from "@/components/campaigns/wizard/WizardFooter";
import { StepAudience } from "@/components/campaigns/wizard/StepAudience";
import { StepMessage } from "@/components/campaigns/wizard/StepMessage";
import { StepReview } from "@/components/campaigns/wizard/StepReview";
import { ConfirmDispatchDialog } from "@/components/campaigns/wizard/DispatchDialogs";
import { useLayout } from "@/lib/layout-context";
import { segmentsApi } from "@/lib/api/segments";
import { campaignsApi, type CampaignPreviewResponse } from "@/lib/api/campaigns";
import type { ApiError } from "@/lib/api-client";

type WizardState = {
  name: string;
  segmentName: string | null;
  templateName: string;
  contentSid: string;
  templateParams: Record<string, string>;
  attributionWindowDays: number;
};

const INITIAL_STATE: WizardState = {
  name: "",
  segmentName: null,
  templateName: "",
  contentSid: "",
  templateParams: {},
  attributionWindowDays: 7,
};

export const Route = createFileRoute("/_app/campanhas/nova")({
  head: () => ({ meta: [{ title: "Nova Campanha — Fidelizza" }] }),
  component: NovaCampanhaPage,
});

function NovaCampanhaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeRestaurant } = useLayout();
  const rid = activeRestaurant?.id ?? "";

  const [step, setStep] = useState<WizardStep>(1);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewResult, setPreviewResult] = useState<CampaignPreviewResponse | null>(null);
  const [previewNoEligible, setPreviewNoEligible] = useState(false);

  const segmentsQuery = useQuery({
    queryKey: ["segments", rid],
    queryFn: () => segmentsApi.getStats(rid),
    enabled: !!rid,
  });
  const segments = segmentsQuery.data?.segments ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      campaignsApi.create(rid, {
        name: state.name,
        segmentName: state.segmentName!,
        templateName: state.templateName,
        contentSid: state.contentSid,
        templateParams: state.templateParams,
        attributionWindowDays: state.attributionWindowDays,
      }),
    onSuccess: (data) => setCampaignId(data.id),
    onError: (err) => toast.error(err instanceof Error ? err.message : "Falha ao criar campanha"),
  });

  const previewMutation = useMutation({
    mutationFn: () => campaignsApi.preview(rid, campaignId!),
    onSuccess: (data) => {
      setPreviewResult(data);
      setPreviewNoEligible(false);
    },
    onError: (err) => {
      const apiErr = err as ApiError;
      if (apiErr.status === 404) {
        setPreviewResult(null);
        setPreviewNoEligible(true);
        return;
      }
      toast.error(apiErr.message || "Falha ao pré-visualizar mensagem");
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: () => campaignsApi.dispatch(rid, campaignId!, crypto.randomUUID()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", rid] });
      navigate({ to: "/campanhas/$campaignId", params: { campaignId: campaignId! } });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Falha ao disparar campanha"),
  });

  const canContinue =
    step === 1
      ? state.name.trim().length > 0 && state.segmentName !== null
      : step === 2
        ? state.templateName.trim().length > 0 && state.contentSid.trim().length > 0
        : true;

  const update = <K extends keyof WizardState>(k: K, v: WizardState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!campaignId) {
        createMutation.mutate();
        return;
      }
      setStep(3);
      return;
    }
    setConfirmOpen(true);
  };

  const handleBack = () => {
    if (step === 2) {
      setCampaignId(null);
      setPreviewResult(null);
      setPreviewNoEligible(false);
    }
    if (step > 1) setStep((s) => (s - 1) as WizardStep);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    dispatchMutation.mutate();
  };

  const selectedSegment = segments.find((s) => s.name === state.segmentName) ?? null;
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
            name={state.name}
            onNameChange={(v) => update("name", v)}
            segments={segments}
            segmentsLoading={segmentsQuery.isLoading}
            segmentName={state.segmentName}
            onSegmentChange={(name) => update("segmentName", name)}
          />
        )}
        {step === 2 && (
          <StepMessage
            templateName={state.templateName}
            onTemplateNameChange={(v) => update("templateName", v)}
            contentSid={state.contentSid}
            onContentSidChange={(v) => update("contentSid", v)}
            templateParams={state.templateParams}
            onTemplateParamsChange={(v) => update("templateParams", v)}
            attributionWindowDays={state.attributionWindowDays}
            onAttributionWindowDaysChange={(n) => update("attributionWindowDays", n)}
            campaignId={campaignId}
            onPreview={() => previewMutation.mutate()}
            previewResult={previewResult}
            previewNoEligible={previewNoEligible}
            isPreviewing={previewMutation.isPending}
          />
        )}
        {step === 3 && (
          <StepReview
            name={state.name}
            segmentLabel={selectedSegment?.label ?? state.segmentName ?? "—"}
            segmentCount={selectedSegment?.count ?? 0}
            templateName={state.templateName}
            hadConsentWarning={previewNoEligible}
          />
        )}

        <WizardFooter
          step={step}
          canContinue={canContinue}
          loading={createMutation.isPending || dispatchMutation.isPending}
          onBack={handleBack}
          onNext={handleNext}
        />
      </div>

      <ConfirmDispatchDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        count={selectedSegment?.count ?? 0}
        onConfirm={handleConfirm}
      />
    </>
  );
}
