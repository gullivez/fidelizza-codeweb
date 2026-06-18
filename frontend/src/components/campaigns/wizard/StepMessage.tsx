import { Info, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WhatsAppPreview } from "./WhatsAppPreview";
import type { CampaignPreviewResponse } from "@/lib/api/campaigns";

type Props = {
  templateName: string;
  onTemplateNameChange: (v: string) => void;
  contentSid: string;
  onContentSidChange: (v: string) => void;
  templateParams: Record<string, string>;
  onTemplateParamsChange: (params: Record<string, string>) => void;
  messageBody: string;
  onMessageBodyChange: (v: string) => void;
  attributionWindowDays: number;
  onAttributionWindowDaysChange: (n: number) => void;
  onPreview: () => void;
  previewResult: CampaignPreviewResponse | null;
  previewNoEligible: boolean;
  isPreviewing: boolean;
};

export function StepMessage({
  templateName,
  onTemplateNameChange,
  contentSid,
  onContentSidChange,
  templateParams,
  onTemplateParamsChange,
  messageBody,
  onMessageBodyChange,
  attributionWindowDays,
  onAttributionWindowDaysChange,
  onPreview,
  previewResult,
  previewNoEligible,
  isPreviewing,
}: Props) {
  const rows = Object.entries(templateParams);

  const updateRow = (index: number, key: string, value: string) => {
    const next = [...rows];
    next[index] = [key, value];
    onTemplateParamsChange(Object.fromEntries(next));
  };

  const addRow = () => {
    onTemplateParamsChange(Object.fromEntries([...rows, [`chave${rows.length + 1}`, ""]]));
  };

  const removeRow = (index: number) => {
    onTemplateParamsChange(Object.fromEntries(rows.filter((_, i) => i !== index)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Configure o template do WhatsApp</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use um Content SID já aprovado no Twilio.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="flex flex-col gap-4">
          <div className="max-w-md">
            <Label htmlFor="template-name" className="text-sm">
              Nome do template
            </Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => onTemplateNameChange(e.target.value)}
              className="mt-1.5 h-9"
            />
          </div>

          <div className="max-w-md">
            <Label htmlFor="content-sid" className="text-sm">
              Content SID
            </Label>
            <Input
              id="content-sid"
              value={contentSid}
              onChange={(e) => onContentSidChange(e.target.value)}
              placeholder="HXabc123..."
              className="mt-1.5 h-9 font-mono"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Encontre no painel Twilio → Content → seu template aprovado. Começa com HX (ex:
              HXabc123def456).
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Parâmetros do template
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={addRow}>
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </Button>
            </div>

            {rows.length > 0 ? (
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-24 text-xs font-medium text-muted-foreground">Variável</span>
                <span className="flex-1 text-xs font-medium text-muted-foreground">
                  Valor de exemplo
                </span>
                <span className="w-9" />
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              {rows.map(([key, value], index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={key}
                    onChange={(e) => updateRow(index, e.target.value, value)}
                    placeholder="1"
                    className="h-9 w-24 font-mono"
                  />
                  <Input
                    value={value}
                    onChange={(e) => updateRow(index, key, e.target.value)}
                    placeholder="João Silva"
                    className="h-9 flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(index)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {rows.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum parâmetro adicionado.</p>
              ) : null}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Cada variável corresponde a {"{{1}}"}, {"{{2}}"}... no seu template aprovado. O valor
              de exemplo é usado na pré-visualização.
            </p>
          </div>

          <div className="max-w-md">
            <Label htmlFor="message-body" className="text-sm">
              Corpo da mensagem
            </Label>
            <Textarea
              id="message-body"
              value={messageBody}
              onChange={(e) => onMessageBodyChange(e.target.value)}
              placeholder="Olá {{1}}, sentimos sua falta! Volte e aproveite nossas ofertas."
              rows={4}
              className="mt-1.5 resize-none"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Use {"{{1}}"}, {"{{2}}"}... para inserir variáveis. Deve ser idêntico ao corpo do
              template aprovado no Twilio.
            </p>
          </div>

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
            <Button
              type="button"
              variant="outline"
              disabled={isPreviewing || !messageBody.trim()}
              onClick={onPreview}
            >
              {isPreviewing ? "Pré-visualizando..." : "Pré-visualizar"}
            </Button>
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
