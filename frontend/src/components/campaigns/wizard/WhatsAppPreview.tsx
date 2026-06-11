import { renderPreview } from "@/lib/campaign-wizard";
import { Check, CheckCheck } from "lucide-react";

export function WhatsAppPreview({
  text,
  restaurante = "Cantina da Nona",
}: {
  text: string;
  restaurante?: string;
}) {
  const rendered = text.trim() ? renderPreview(text) : "";
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[2.25rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-xl overflow-hidden">
      {/* Notch */}
      <div className="relative h-5 bg-zinc-900">
        <div className="absolute left-1/2 top-1 h-3 w-20 -translate-x-1/2 rounded-full bg-zinc-800" />
      </div>
      {/* Header */}
      <div className="bg-[#075e54] text-white px-3 py-2.5 flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
          {restaurante.slice(0, 1)}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{restaurante}</div>
          <div className="text-[10px] text-white/70">online</div>
        </div>
      </div>
      {/* Chat */}
      <div
        className="px-3 py-4 min-h-[360px]"
        style={{
          backgroundColor: "#e5ddd5",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.04) 0, transparent 40%)",
        }}
      >
        {rendered ? (
          <div className="max-w-[85%] rounded-lg rounded-tl-none bg-[#dcf8c6] px-3 py-2 shadow-sm">
            <p className="text-[13px] leading-snug text-zinc-900 whitespace-pre-wrap break-words">
              {rendered}
            </p>
            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-zinc-500">
              <span>14:32</span>
              <CheckCheck className="h-3 w-3 text-[#34b7f1]" />
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-zinc-500 mt-12">
            Sua mensagem aparecerá aqui
          </div>
        )}
      </div>
    </div>
  );
}

// silence unused import warning if Check is not used in some bundlers
export const _Check = Check;
