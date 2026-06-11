import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { TEMPLATES } from "@/lib/campaign-wizard";
import { WhatsAppPreview } from "./WhatsAppPreview";
import { cn } from "@/lib/utils";

type Props = {
  mensagem: string;
  onChange: (v: string) => void;
};

const MAX_CHARS = 1000;
const VARIABLES = ["{nome}", "{restaurante}"];

export function StepMessage({ mensagem, onChange }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (token: string) => {
    const el = ref.current;
    if (!el) {
      onChange(mensagem + token);
      return;
    }
    const start = el.selectionStart ?? mensagem.length;
    const end = el.selectionEnd ?? mensagem.length;
    const next = mensagem.slice(0, start) + token + mensagem.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Escreva sua mensagem
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use um template ou personalize do zero.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Templates sugeridos
            </div>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChange(t.body)}
                  className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  {t.nome}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Variáveis
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {VARIABLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertAtCursor(v)}
                  className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-mono text-indigo-700 hover:bg-indigo-100"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Textarea
              ref={ref}
              value={mensagem}
              onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
              rows={8}
              placeholder="Oi {nome}! ..."
              className="resize-none pb-7"
            />
            <div
              className={cn(
                "absolute bottom-2 right-3 text-xs tabular-nums",
                mensagem.length > MAX_CHARS * 0.9
                  ? "text-amber-600"
                  : "text-muted-foreground",
              )}
            >
              {mensagem.length}/{MAX_CHARS}
            </div>
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            💡 Personalize com{" "}
            <span className="font-mono">{"{nome}"}</span> e evite enviar só links —
            protege seu número.
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <WhatsAppPreview text={mensagem} />
        </div>
      </div>
    </div>
  );
}
