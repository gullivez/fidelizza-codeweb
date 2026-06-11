import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ACCOUNT, type BillingStatus } from "@/lib/mock-settings";

export function ContaPanel({ billingOverride }: { billingOverride?: BillingStatus }) {
  const billing = billingOverride ?? ACCOUNT.billingStatus;
  const [empresa, setEmpresa] = useState(ACCOUNT.empresa);
  const [cnpj, setCnpj] = useState(ACCOUNT.cnpj);
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Dados da empresa salvos");
    }, 800);
  };

  const billingBadge =
    billing === "active" ? (
      <StatusBadge variant="success">Ativo</StatusBadge>
    ) : billing === "past_due" ? (
      <StatusBadge variant="warning">Pagamento pendente</StatusBadge>
    ) : (
      <StatusBadge variant="neutral">Cancelado</StatusBadge>
    );

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-base font-semibold text-foreground">Conta</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Dados da empresa e plano de assinatura.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">Dados da empresa</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="empresa">Razão social</Label>
            <Input id="empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={save} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">Plano & Assinatura</h3>
            {billingBadge}
          </div>
          <Button variant="outline" size="sm">Gerenciar assinatura</Button>
        </div>

        {billing === "past_due" && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <strong className="font-semibold">Pagamento pendente.</strong>{" "}
            Regularize para evitar suspensão.{" "}
            <button className="font-medium underline">Atualizar pagamento</button>
          </div>
        )}

        <div className="mt-4 text-sm text-muted-foreground">
          Plano atual: <span className="font-medium text-foreground">{ACCOUNT.plano}</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <UsageBar
            label="Números de WhatsApp"
            used={ACCOUNT.uso.whatsappNumeros}
            limit={ACCOUNT.limites.whatsappNumeros}
          />
          <UsageBar
            label="Restaurantes"
            used={ACCOUNT.uso.restaurantes}
            limit={ACCOUNT.limites.restaurantes}
          />
        </div>
      </section>
    </div>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">{used}/{limit}</span>
      </div>
      <Progress value={pct} className="mt-2 h-1.5" />
    </div>
  );
}
