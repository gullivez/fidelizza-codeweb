import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlugZap, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SegmentChips } from "@/components/customers/SegmentChips";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { Pagination } from "@/components/customers/Pagination";
import { useLayout } from "@/lib/layout-context";
import { customersApi } from "@/lib/api/customers";
import type { ApiCustomer } from "@/lib/api/customers";
import type { Customer, Segment } from "@/lib/mock-customers";

const PAGE_SIZE = 20;

const validSegments: Segment[] = ["todos", "campeoes", "novos", "em-risco", "inativos"];

type ClientesSearch = { segmento: Segment; q: string; page: number };

export const Route = createFileRoute("/_app/clientes/")({
  head: () => ({
    meta: [
      { title: "Clientes — Fidelizza" },
      { name: "description", content: "Sua base de clientes do restaurante." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => {
    const seg = s.segmento as string | undefined;
    return {
      segmento: (validSegments.includes(seg as Segment) ? seg : "todos") as Segment,
      q: typeof s.q === "string" ? s.q : "",
      page: Math.max(1, Number(s.page) || 1),
    };
  },
  component: ClientesPage,
});

function mapApiToCustomer(c: ApiCustomer): Customer {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    // Sprint 3 adicionará RFM — por enquanto todos os clientes são exibidos como 'novos'
    segment: "novos" as Segment & "novos",
    lastOrderAt: c.lastOrderAt ?? c.createdAt,
    orders: c.totalOrders,
    totalSpent: c.totalSpent,
  };
}

function ClientesPage() {
  const { segmento, q, page } = Route.useSearch() as ClientesSearch;
  const navigate = useNavigate({ from: "/clientes/" });
  const { activeRestaurant } = useLayout();
  const rid = activeRestaurant?.id ?? "";

  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => { setSearchInput(q); }, [q]);

  useEffect(() => {
    if (searchInput === q) return;
    const t = setTimeout(() => {
      void navigate({ search: (prev: ClientesSearch) => ({ ...prev, q: searchInput, page: 1 }) });
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, q, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", rid, { page, q }],
    queryFn: () => customersApi.list(rid, { page, limit: PAGE_SIZE, search: q || undefined }),
    enabled: !!rid,
  });

  const customers: Customer[] = (data?.data ?? []).map(mapApiToCustomer);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const searchSlot = (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Buscar por nome ou telefone"
        className="w-72 h-9 pl-8"
      />
    </div>
  );

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle={`Sua base de clientes — ${activeRestaurant?.name ?? ""}`}
        action={searchSlot}
      />

      {!rid ? (
        <EmptyState
          icon={PlugZap}
          title="Selecione um restaurante"
          description="Escolha um restaurante no menu para ver seus clientes."
        />
      ) : (
        <>
          <SegmentChips active={segmento} />

          <CustomersTable data={customers} loading={isLoading} />

          {total > 0 && (
            <Pagination
              page={safePage}
              pageSize={PAGE_SIZE}
              total={total}
              onChange={(p) =>
                void navigate({ search: (prev: ClientesSearch) => ({ ...prev, page: p }) })
              }
            />
          )}

          {!isLoading && total === 0 && (
            <EmptyState
              icon={PlugZap}
              title="Nenhum cliente ainda"
              description="Conecte e sincronize uma integração para importar seus clientes."
              action={
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <a href="/integracoes">Ir para Integrações</a>
                </Button>
              }
            />
          )}
        </>
      )}
    </>
  );
}
