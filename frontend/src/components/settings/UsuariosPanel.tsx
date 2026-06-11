import { useState } from "react";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils";
import {
  CURRENT_USER,
  RESTAURANTS,
  USERS,
  type Role,
  type SettingsUser,
} from "@/lib/mock-settings";

const roleStyles: Record<Role, string> = {
  owner: "bg-indigo-50 text-indigo-700 border-indigo-200",
  admin: "bg-emerald-50 text-emerald-700 border-emerald-200",
  operator: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

const roleLabels: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  operator: "Operator",
};

export function UsuariosPanel() {
  const [users] = useState<SettingsUser[]>(USERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [access, setAccess] = useState<Record<string, Set<string>>>(() => {
    const map: Record<string, Set<string>> = {};
    USERS.forEach((u) => {
      // Owner & admin start with all access
      map[u.id] = new Set(
        u.role === "operator" ? [RESTAURANTS[0].id] : RESTAURANTS.map((r) => r.id),
      );
    });
    return map;
  });

  const toggle = (userId: string, restaurantId: string) => {
    setAccess((prev) => {
      const next = { ...prev };
      const set = new Set(next[userId]);
      if (set.has(restaurantId)) set.delete(restaurantId);
      else set.add(restaurantId);
      next[userId] = set;
      return next;
    });
  };

  const columns: Column<SettingsUser>[] = [
    {
      key: "nome",
      header: "Nome",
      accessor: (u) => u.nome,
      cell: (u) => <span className="font-medium text-foreground">{u.nome}</span>,
      sortable: true,
    },
    { key: "email", header: "Email", accessor: (u) => u.email, sortable: true },
    {
      key: "role",
      header: "Papel",
      cell: (u) => (
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
            roleStyles[u.role],
          )}
        >
          {roleLabels[u.role]}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (u) =>
        u.status === "ativo" ? (
          <StatusBadge variant="success">Ativo</StatusBadge>
        ) : (
          <StatusBadge variant="warning">Pendente</StatusBadge>
        ),
    },
    {
      key: "actions",
      header: "",
      width: "48px",
      align: "right",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info("Editar papel (mock)")}>
              Editar papel
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-rose-600"
              onClick={() => toast.info("Remover (mock)")}
            >
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Usuários & Acessos</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Gerencie quem pode acessar a conta e seus restaurantes.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <UserPlus className="h-4 w-4" />
          Convidar usuário
        </Button>
      </header>

      <DataTable<SettingsUser>
        columns={columns}
        data={users}
        rowKey={(u) => u.id}
      />

      {CURRENT_USER.accountType === "agency" && (
        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Acesso a restaurantes</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Defina quais restaurantes cada usuário pode visualizar e gerenciar.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Usuário</th>
                  {RESTAURANTS.map((r) => (
                    <th key={r.id} className="px-3 py-2 text-center font-medium">{r.nome}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isOwner = u.role === "owner";
                  return (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-foreground">{u.nome}</div>
                        <div className="text-xs text-muted-foreground">{roleLabels[u.role]}</div>
                      </td>
                      {RESTAURANTS.map((r) => {
                        const checked = access[u.id]?.has(r.id) ?? false;
                        return (
                          <td key={r.id} className="px-3 py-3 text-center">
                            <Checkbox
                              checked={isOwner ? true : checked}
                              disabled={isOwner}
                              onCheckedChange={() => toggle(u.id, r.id)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input id="invite-email" type="email" placeholder="nome@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label>Papel</Label>
              <Select defaultValue="operator">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancelar</Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                setInviteOpen(false);
                toast.success("Convite enviado");
              }}
            >
              Enviar convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
