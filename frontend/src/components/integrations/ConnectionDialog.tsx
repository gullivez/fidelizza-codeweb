import { useEffect, useState } from "react";
import { Check, HelpCircle, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Provider } from "@/lib/mock-integrations";

type TestState = "idle" | "testing" | "success" | "error";

export function ConnectionDialog({
  provider,
  open,
  onOpenChange,
  onConnect,
}: {
  provider: Provider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: () => void;
}) {
  const [token, setToken] = useState("");
  const [test, setTest] = useState<TestState>("idle");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!open) {
      setToken("");
      setTest("idle");
      setShowHelp(false);
    }
  }, [open]);

  if (!provider) return null;

  const handleTest = () => {
    setTest("testing");
    setTimeout(() => {
      setTest(token.trim().length >= 8 ? "success" : "error");
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar {provider.nome}</DialogTitle>
          <DialogDescription>{provider.descricao}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="token">Token de acesso</Label>
              <button
                type="button"
                onClick={() => setShowHelp((s) => !s)}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
              >
                <HelpCircle className="h-3 w-3" />
                Onde encontrar?
              </button>
            </div>
            <Input
              id="token"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setTest("idle");
              }}
              placeholder="Cole o token aqui"
              autoComplete="off"
            />
            {showHelp && (
              <p className="rounded-md bg-zinc-50 p-2 text-xs text-muted-foreground">
                {provider.helper}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={!token.trim() || test === "testing"}
            >
              {test === "testing" && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Testar conexão
            </Button>
            {test === "success" && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                <Check className="h-3.5 w-3.5" /> Conexão funcionando
              </span>
            )}
            {test === "error" && (
              <span className="inline-flex items-center gap-1 text-xs text-rose-700">
                <X className="h-3.5 w-3.5" /> Token inválido
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={test !== "success"}
            onClick={() => {
              onConnect();
              onOpenChange(false);
            }}
          >
            Conectar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
