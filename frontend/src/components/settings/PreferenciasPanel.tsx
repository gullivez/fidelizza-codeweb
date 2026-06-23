import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PREFS, TIMEZONES } from "@/lib/mock-settings";
import { useLayout } from "@/lib/layout-context";
import { updateRestaurant as updateRestaurantApi } from "@/lib/api/restaurants";

export function PreferenciasPanel() {
  const { activeRestaurant, updateRestaurant } = useLayout();
  const [tz, setTz] = useState(PREFS.timezone);
  const [name, setName] = useState(activeRestaurant?.name ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(activeRestaurant?.name ?? "");
  }, [activeRestaurant?.id, activeRestaurant?.name]);

  const save = async () => {
    if (!activeRestaurant) return;
    const previousName = activeRestaurant.name;
    setSaving(true);
    try {
      const updated = await updateRestaurantApi(activeRestaurant.id, { name });
      updateRestaurant(updated);
      setName(updated.name);
      toast.success("Preferências salvas");
    } catch {
      setName(previousName);
      toast.error("Não foi possível salvar as preferências");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-base font-semibold text-foreground">Preferências</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Ajustes gerais que afetam campanhas e exibição.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-5 space-y-5">
        <div className="space-y-2">
          <Label>Fuso horário</Label>
          <Select value={tz} onValueChange={setTz}>
            <SelectTrigger className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rname">Nome do restaurante</Label>
          <Input
            id="rname"
            className="max-w-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Aparece nas mensagens das campanhas no lugar da variável{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5">{"{restaurante}"}</code>.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={save}
            disabled={saving || !activeRestaurant}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar preferências
          </Button>
        </div>
      </section>
    </div>
  );
}
