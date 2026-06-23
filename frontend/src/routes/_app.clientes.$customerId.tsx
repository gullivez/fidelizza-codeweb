import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserX, MessageCircleOff } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CustomerKpiStrip } from "@/components/customer/CustomerKpiStrip";
import { CustomerDetailSkeleton } from "@/components/customer/CustomerDetailSkeleton";
import { useLayout } from "@/lib/layout-context";
import { customersApi } from "@/lib/api/customers";
import type { ApiCustomerDetail, ApiOrderSummary } from "@/lib/api/customers";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_app/clientes/$customerId")({
  head: () => ({ meta: [{ title: "Cliente — Fidelizza" }] }),
  component: CustomerDetailPage,
});

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) {
    const local = digits.slice(2);
    if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
    if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return phone;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function CustomerDetailPage() {
  const { customerId } = Route.useParams();
  const { activeRestaurant } = useLayout();
  const rid = activeRestaurant?.id ?? "";
  const queryClient = useQueryClient();
  const [confirmOptOutOpen, setConfirmOptOutOpen] = useState(false);

  const {
    data: customer,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customer", rid, customerId],
    queryFn: () => customersApi.get(rid, customerId),
    enabled: !!rid && !!customerId,
  });

  const optOutMutation = useMutation({
    mutationFn: () => customersApi.optOut(rid, customerId),
    onSuccess: () => {
      queryClient.setQueryData<ApiCustomerDetail | undefined>(
        ["customer", rid, customerId],
        (prev) => (prev ? { ...prev, consentWhatsapp: false } : prev),
      );
      toast.success("Comunicações desativadas para este cliente.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Falha ao desativar comunicações");
    },
  });

  if (isLoading) return <CustomerDetailSkeleton />;

  if (isError || !customer) {
    return (
      <EmptyState
        icon={UserX}
        title="Cliente não encontrado"
        description="O cliente que você tentou abrir não existe ou foi removido."
        action={
          <Button asChild>
            <Link to="/clientes" search={{ segmento: "todos" as const, q: "", page: 1 }}>
              Voltar para clientes
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <CustomerDetailHeader customer={customer} />

      <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Comunicações via WhatsApp</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Controla se este cliente pode receber campanhas futuras.
          </p>
        </div>
        {customer.consentWhatsapp === false ? (
          <StatusBadge variant="neutral">Comunicações desativadas</StatusBadge>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="text-rose-700 border-rose-200 hover:bg-rose-50"
            onClick={() => setConfirmOptOutOpen(true)}
            disabled={optOutMutation.isPending}
          >
            <MessageCircleOff className="h-4 w-4" />
            Não desejo receber comunicações
          </Button>
        )}
      </div>

      <AlertDialog open={confirmOptOutOpen} onOpenChange={setConfirmOptOutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar comunicações deste cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação impedirá que este cliente receba campanhas futuras. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOptOutOpen(false);
                optOutMutation.mutate();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Desativar comunicações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CustomerKpiStrip
        totalSpent={customer.totalSpent}
        orders={customer.totalOrders}
        avgTicket={customer.avgTicket}
        customerSince={customer.createdAt}
        lastOrderAt={customer.lastOrderAt ?? customer.createdAt}
      />
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Últimos pedidos</h2>
        {customer.recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pedido registrado.</p>
        ) : (
          <div className="rounded-lg border border-border divide-y divide-border">
            {customer.recentOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function CustomerDetailHeader({ customer }: { customer: ApiCustomerDetail }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-5 mb-6">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold shrink-0">
          {initials(customer.name)}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground truncate">
            {customer.name}
          </h1>
          <span className="num tabular-nums text-sm text-muted-foreground">
            {formatPhone(customer.phone)}
          </span>
        </div>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link to="/clientes" search={{ segmento: "todos" as const, q: "", page: 1 }}>
          ← Voltar
        </Link>
      </Button>
    </div>
  );
}

function OrderRow({ order }: { order: ApiOrderSummary }) {
  const statusLabel: Record<string, string> = {
    pending: "Pendente",
    confirmed: "Confirmado",
    ready: "Pronto",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <div>
        <span className="font-medium text-foreground">
          {formatDistanceToNow(new Date(order.orderedAt), { addSuffix: true, locale: ptBR })}
        </span>
        <span className="ml-2 text-xs text-muted-foreground">
          {format(new Date(order.orderedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">
          {statusLabel[order.status] ?? order.status}
        </span>
        <span className="num tabular-nums font-medium">{formatBRL(order.totalAmount)}</span>
      </div>
    </div>
  );
}
