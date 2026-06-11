import { Link } from "@tanstack/react-router";
import { Megaphone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CampaignsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-lg border border-dashed border-border bg-card">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <Megaphone className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-foreground">
        Crie sua primeira campanha
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Você tem <span className="font-medium text-foreground">653 clientes inativos</span>{" "}
        esperando para voltar. Recupere-os com uma mensagem no WhatsApp.
      </p>
      <Button asChild className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white">
        <Link to="/campanhas/nova">
          <Plus className="h-4 w-4" />
          Criar primeira campanha
        </Link>
      </Button>
    </div>
  );
}
