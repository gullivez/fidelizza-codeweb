import { useState } from "react";
import { Check, MoreHorizontal, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  RESTAURANTS,
  type SettingsRestaurant,
  formatBR,
} from "@/lib/mock-settings";
import { cn } from "@/lib/utils";

export function RestaurantesPanel() {
  const [list, setList] = useState<SettingsRestaurant[]>(RESTAURANTS);
  const [addOpen, setAddOpen] = useState(false);

  const archive = (id: string) => {
    setList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "arquivado" } : r)),
    );
    toast.success("Restaurante arquivado");
  };

  const columns: Column<SettingsRestaurant>[] = [
    {
      key: "nome",
      header: "Nome",
      accessor: (r) => r.nome,
      sortable: true,
      cell: (r) => (
        <span className={cn("font-medium", r.status === "arquivado" ? "text-muted-foreground" : "text-foreground")}>
          {r.nome}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) =>
        r.status === "ativo" ? (
          <StatusBadge variant="success">Ativo</StatusBadge>
        ) : (
          <StatusBadge variant="neutral">Arquivado</StatusBadge>
        ),
    },
    {
      key: "clientes",
      header: "Clientes",
      align: "right",
      accessor: (r) => r.clientes,
      sortable: true,
      cell: (r) => <span className="tabular-nums">{formatBR(r.clientes)}</span>,
    },
    {
      key: "whatsapp",
      header: "WhatsApp",
      cell: (r) =>
        r.whatsappConnected ? (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
            <Check className="h-4 w-4" /> Conectado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <X className="h-4 w-4" /> Não conectado
          </span>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "48px",
      cell: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info("Editar (mock)")}>
              Editar
            </DropdownMenuItem>
            {r.status === "ativo" && (
              <DropdownMenuItem className="text-rose-600" onClick={() => archive(r.id)}>
                Arquivar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Restaurantes</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Lojas vinculadas à sua conta.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Adicionar restaurante
        </Button>
      </header>

      <DataTable<SettingsRestaurant>
        columns={columns}
        data={list}
        rowKey={(r) => r.id}
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar restaurante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="r-nome">Nome</Label>
              <Input id="r-nome" placeholder="Ex.: Burger House Itaim" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-end">Endereço</Label>
              <Input id="r-end" placeholder="Rua, número — bairro" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                setAddOpen(false);
                toast.success("Restaurante adicionado");
              }}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
