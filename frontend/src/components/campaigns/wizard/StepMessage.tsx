import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhatsAppPreview } from "./WhatsAppPreview";
import {
  campaignsApi,
  type CampaignPreviewResponse,
  type TemplateVariableMap,
  type TwilioTemplate,
} from "@/lib/api/campaigns";

type Props = {
  restaurantId: string;
  selectedContentSid: string;
  onTemplateSelect: (template: TwilioTemplate) => void;
  templateVariables: TemplateVariableMap;
  onTemplateVariablesChange: (variables: TemplateVariableMap) => void;
  messageBody: string;
  attributionWindowDays: number;
  onAttributionWindowDaysChange: (n: number) => void;
  onPreview: () => void;
  previewResult: CampaignPreviewResponse | null;
  previewNoEligible: boolean;
  isPreviewing: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  contact: "Contato",
  restaurant: "Restaurante",
};

export function StepMessage({
  restaurantId,
  selectedContentSid,
  onTemplateSelect,
  templateVariables,
  onTemplateVariablesChange,
  messageBody,
  attributionWindowDays,
  onAttributionWindowDaysChange,
  onPreview,
  previewResult,
  previewNoEligible,
  isPreviewing,
}: Props) {
  const templatesQuery = useQuery({
    queryKey: ["templates", restaurantId],
    queryFn: () => campaignsApi.listTemplates(restaurantId),
    enabled: !!restaurantId,
  });

  const variablesQuery = useQuery({
    queryKey: ["variables", restaurantId],
    queryFn: () => campaignsApi.listVariables(restaurantId),
    enabled: !!restaurantId,
  });

  const templates = templatesQuery.data ?? [];
  const variables = variablesQuery.data ?? [];
  const selectedTemplate = templates.find((t) => t.contentSid === selectedContentSid) ?? null;

  const variablesByCategory = variables.reduce<Record<string, typeof variables>>((acc, v) => {
    (acc[v.category] ??= []).push(v);
    return acc;
  }, {});

  useEffect(() => {
    if (templatesQuery.isError) {
      toast.error("Não foi possível carregar os templates");
    }
  }, [templatesQuery.isError]);

  const allVariablesFilled =
    !selectedTemplate ||
    Array.from({ length: selectedTemplate.variableCount }, (_, i) => String(i + 1)).every((key) => {
      const entry = templateVariables[key];
      if (!entry) return false;
      return entry.type === "dynamic" ? entry.key.length > 0 : entry.value.trim().length > 0;
    });

  const previewDisabled = isPreviewing || !messageBody.trim() || !allVariablesFilled;
  const previewDisabledReason =
    messageBody.trim() && !allVariablesFilled
      ? "Preencha todas as variáveis antes de pré-visualizar."
      : undefined;

  const previewButton = (
    <Button type="button" variant="outline" disabled={previewDisabled} onClick={onPreview}>
      {isPreviewing ? "Pré-visualizando..." : "Pré-visualizar"}
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Configure o template do WhatsApp</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha um template aprovado no Twilio.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="flex flex-col gap-4">
          <div className="max-w-md">
            <Label htmlFor="template-select" className="text-sm">
              Template
            </Label>

            {templatesQuery.isError ? (
              <p className="mt-1.5 text-sm text-destructive">
                Não foi possível carregar os templates. Tente novamente em instantes.
              </p>
            ) : !templatesQuery.isLoading && templates.length === 0 ? (
              <p className="mt-1.5 text-sm text-muted-foreground">
                Nenhum template encontrado. Crie um no painel Twilio.
              </p>
            ) : (
              <Select
                value={selectedContentSid || undefined}
                onValueChange={(sid) => {
                  const template = templates.find((t) => t.contentSid === sid);
                  if (template) onTemplateSelect(template);
                }}
                disabled={templatesQuery.isLoading}
              >
                <SelectTrigger id="template-select" className="mt-1.5 h-9">
                  <SelectValue
                    placeholder={
                      templatesQuery.isLoading ? "Carregando templates..." : "Selecione um template"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.contentSid} value={t.contentSid}>
                      {t.friendlyName} ({t.language})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedTemplate ? (
            <div className="max-w-md">
              <Label className="text-sm">Corpo do template (Twilio)</Label>
              <div className="mt-1.5 rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {messageBody}
              </div>
            </div>
          ) : null}

          {selectedTemplate && selectedTemplate.variableCount > 0 ? (
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Variáveis do template
              </div>

              <div className="flex flex-col gap-3">
                {Array.from({ length: selectedTemplate.variableCount }, (_, i) => {
                  const key = String(i + 1);
                  const entry = templateVariables[key] ?? { type: "static" as const, value: "" };

                  return (
                    <div key={key} className="max-w-md">
                      <Label className="text-xs text-muted-foreground">Variável {key}</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Select
                          value={entry.type}
                          onValueChange={(mode) => {
                            onTemplateVariablesChange({
                              ...templateVariables,
                              [key]:
                                mode === "dynamic"
                                  ? { type: "dynamic", key: "" }
                                  : { type: "static", value: "" },
                            });
                          }}
                        >
                          <SelectTrigger className="h-9 w-45 shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="static">Valor fixo</SelectItem>
                            <SelectItem value="dynamic">Variável do sistema</SelectItem>
                          </SelectContent>
                        </Select>

                        {entry.type === "static" ? (
                          <Input
                            value={entry.value}
                            onChange={(e) =>
                              onTemplateVariablesChange({
                                ...templateVariables,
                                [key]: { type: "static", value: e.target.value },
                              })
                            }
                            placeholder="Valor de exemplo"
                            className="h-9 flex-1"
                          />
                        ) : (
                          <Select
                            value={entry.key || undefined}
                            onValueChange={(varKey) =>
                              onTemplateVariablesChange({
                                ...templateVariables,
                                [key]: { type: "dynamic", key: varKey },
                              })
                            }
                          >
                            <SelectTrigger className="h-9 flex-1">
                              <SelectValue placeholder="Selecione uma variável" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(variablesByCategory).map(([category, defs]) => (
                                <SelectGroup key={category}>
                                  <SelectLabel>{CATEGORY_LABELS[category] ?? category}</SelectLabel>
                                  {defs.map((v) => (
                                    <SelectItem key={v.key} value={v.key}>
                                      {v.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Escolha &quot;Variável do sistema&quot; para preencher automaticamente com dados do
                cliente, ou &quot;Valor fixo&quot; para um texto igual em todas as mensagens (ex: um
                cupom).
              </p>
            </div>
          ) : null}

          <div className="flex items-end gap-3 max-w-md">
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="janela" className="text-sm">
                  Janela de atribuição
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground">
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Pedidos feitos em até {attributionWindowDays} dias após a mensagem contam como
                      conversão desta campanha.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <Input
                  id="janela"
                  type="number"
                  min={1}
                  max={90}
                  value={attributionWindowDays}
                  onChange={(e) =>
                    onAttributionWindowDaysChange(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-24 h-9"
                />
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
            </div>
          </div>

          <div>
            {previewDisabledReason ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={-1}>{previewButton}</span>
                  </TooltipTrigger>
                  <TooltipContent>{previewDisabledReason}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              previewButton
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          {previewNoEligible ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Nenhum cliente com WhatsApp habilitado foi encontrado neste segmento.
            </div>
          ) : (
            <WhatsAppPreview renderedMessage={previewResult?.renderedMessage ?? ""} />
          )}
        </div>
      </div>
    </div>
  );
}
