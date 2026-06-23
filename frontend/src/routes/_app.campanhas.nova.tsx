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
import { formatDateTime } from "@/lib/campaign-format";
import { segmentsApi } from "@/lib/api/segments";
import {
  campaignsApi,
  toBrtIso,
  type CampaignPreviewResponse,
  type TemplateVariableMap,
  type TwilioTemplate,
} from "@/lib/api/campaigns";
import type { ApiError } from "@/lib/api-client";

type WizardState = {
  name: string;
  segmentName: string | null;
  templateName: string;
  contentSid: string;
  messageBody: string;
  templateVariables: TemplateVariableMap;
  attributionWindowDays: number;
};

type CreatedSnapshot = Omit<WizardState, "segmentName"> & { segmentName: string };

const INITIAL_STATE: WizardState = {
  name: "",
  segmentName: null,
  templateName: "",
  contentSid: "",
  messageBody: "",
  templateVariables: {},
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
  const [createdSnapshot, setCreatedSnapshot] = useState<CreatedSnapshot | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewResult, setPreviewResult] = useState<CampaignPreviewResponse | null>(null);
  const [previewNoEligible, setPreviewNoEligible] = useState(false);
  const [dispatchMode, setDispatchMode] = useState<"now" | "schedule">("now");
  const [scheduledAtLocal, setScheduledAtLocal] = useState("");

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
        messageBody: state.messageBody,
        templateVariables: state.templateVariables,
        attributionWindowDays: state.attributionWindowDays,
      }),
    onError: (err) => toast.error(err instanceof Error ? err.message : "Falha ao criar campanha"),
  });

  const previewMutation = useMutation({
    mutationFn: (id: string) => campaignsApi.preview(rid, id),
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
    mutationFn: () =>
      campaignsApi.dispatch(
        rid,
        campaignId!,
        crypto.randomUUID(),
        dispatchMode === "schedule" ? toBrtIso(scheduledAtLocal) : undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", rid] });
      navigate({ to: "/campanhas/$campaignId", params: { campaignId: campaignId! } });
    },
    onError: (err) => {
      const apiErr = err as ApiError;
      if (apiErr.status === 400) {
        toast.error("Escolha um horário com pelo menos 5 minutos de antecedência.");
        return;
      }
      toast.error(err instanceof Error ? err.message : "Falha ao disparar campanha");
    },
  });

  const hasPreviewed = previewResult !== null || previewNoEligible;

  const canContinue =
    step === 1
      ? state.name.trim().length > 0 && state.segmentName !== null
      : step === 2
        ? state.templateName.trim().length > 0 &&
          state.contentSid.trim().length > 0 &&
          state.messageBody.trim().length > 0 &&
          hasPreviewed
        : dispatchMode === "schedule"
          ? scheduledAtLocal.trim().length > 0
          : true;

  const update = <K extends keyof WizardState>(k: K, v: WizardState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const handleTemplateSelect = (template: TwilioTemplate) => {
    setState((s) => ({
      ...s,
      templateName: template.friendlyName,
      contentSid: template.contentSid,
      messageBody: template.body,
      templateVariables: Object.fromEntries(
        Array.from({ length: template.variableCount }, (_, i) => [
          String(i + 1),
          { type: "static" as const, value: "" },
        ]),
      ),
    }));
  };

  const handlePreview = async () => {
    const isStale =
      !campaignId ||
      !createdSnapshot ||
      createdSnapshot.name !== state.name ||
      createdSnapshot.segmentName !== state.segmentName ||
      createdSnapshot.templateName !== state.templateName ||
      createdSnapshot.contentSid !== state.contentSid ||
      createdSnapshot.messageBody !== state.messageBody ||
      createdSnapshot.attributionWindowDays !== state.attributionWindowDays ||
      JSON.stringify(createdSnapshot.templateVariables) !== JSON.stringify(state.templateVariables);

    let id = campaignId;

    if (isStale) {
      try {
        const created = await createMutation.mutateAsync();
        id = created.id;
        setCampaignId(id);
        setCreatedSnapshot({ ...state, segmentName: state.segmentName! });
      } catch {
        return;
      }
    }

    if (!id) return;
    previewMutation.mutate(id);
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    setConfirmOpen(true);
  };

  const handleBack = () => {
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
            restaurantId={rid}
            selectedContentSid={state.contentSid}
            onTemplateSelect={handleTemplateSelect}
            templateVariables={state.templateVariables}
            onTemplateVariablesChange={(v) => update("templateVariables", v)}
            messageBody={state.messageBody}
            attributionWindowDays={state.attributionWindowDays}
            onAttributionWindowDaysChange={(n) => update("attributionWindowDays", n)}
            onPreview={handlePreview}
            previewResult={previewResult}
            previewNoEligible={previewNoEligible}
            isPreviewing={createMutation.isPending || previewMutation.isPending}
          />
        )}
        {step === 3 && (
          <StepReview
            restaurantId={rid}
            name={state.name}
            segmentLabel={selectedSegment?.label ?? state.segmentName ?? "—"}
            segmentCount={selectedSegment?.count ?? 0}
            templateName={state.templateName}
            attributionWindowDays={state.attributionWindowDays}
            templateVariables={state.templateVariables}
            hadConsentWarning={previewNoEligible}
            dispatchMode={dispatchMode}
            onDispatchModeChange={setDispatchMode}
            scheduledAtLocal={scheduledAtLocal}
            onScheduledAtLocalChange={setScheduledAtLocal}
          />
        )}

        <WizardFooter
          step={step}
          canContinue={canContinue}
          loading={dispatchMutation.isPending}
          nextLabel={step === 3 && dispatchMode === "schedule" ? "Agendar campanha" : undefined}
          disabledReason={
            step === 2 && !hasPreviewed
              ? "Pré-visualize a mensagem antes de continuar."
              : step === 3 && dispatchMode === "schedule" && !scheduledAtLocal.trim()
                ? "Escolha um horário antes de agendar."
                : undefined
          }
          onBack={handleBack}
          onNext={handleNext}
        />
      </div>

      <ConfirmDispatchDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        count={selectedSegment?.count ?? 0}
        onConfirm={handleConfirm}
        scheduled={dispatchMode === "schedule"}
        scheduledAtLabel={scheduledAtLocal ? formatDateTime(toBrtIso(scheduledAtLocal)) : undefined}
      />
    </>
  );
}
