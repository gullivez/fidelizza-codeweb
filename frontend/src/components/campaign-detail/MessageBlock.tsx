import { MessageSquare } from "lucide-react";

export function MessageBlock({ mensagem }: { mensagem: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Mensagem enviada</h3>
      </div>
      <div className="rounded-md border border-border bg-zinc-50 p-4">
        <p className="font-mono text-sm whitespace-pre-wrap text-foreground">
          {mensagem}
        </p>
      </div>
    </div>
  );
}
