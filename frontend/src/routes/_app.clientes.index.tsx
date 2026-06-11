import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PlugZap, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SegmentChips } from "@/components/customers/SegmentChips";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { Pagination } from "@/components/customers/Pagination";
import { ContextualActionBar } from "@/components/customers/ContextualActionBar";
import { filterCustomers, segmentCounts, type Segment } from "@/lib/mock-customers";
import { useLayout } from "@/lib/layout-context";

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

type ViewState = "populated" | "loading" | "no-integration";

function ClientesPage() {
  const { segmento, q, page } = Route.useSearch() as ClientesSearch;
  const navigate = useNavigate({ from: "/clientes" });
  const { activeRestaurant } = useLayout();
  const [viewState] = useState<ViewState>("populated");
  const [searchInput, setSearchInput] = useState(q);

  // sync local input when URL changes externally
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // debounce search → URL
  useEffect(() => {
    if (searchInput === q) return;
    const t = setTimeout(() => {
      navigate({ search: (prev: ClientesSearch) => ({ ...prev, q: searchInput, page: 1 }) });
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, q, navigate]);

  const filtered = useMemo(() => filterCustomers(segmento, q), [segmento, q]);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
        subtitle={`Sua base de clientes — ${activeRestaurant.name}`}
        action={searchSlot}
      />

      {viewState === "no-integration" ? (
        <EmptyState
          icon={PlugZap}
          title="Conecte uma fonte de dados"
          description="Conecte seu sistema de delivery para importar pedidos e ver seus clientes aqui."
          action={
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <a href="/integracoes">Ir para Integrações</a>
            </Button>
          }
        />
      ) : (
        <>
          <SegmentChips active={segmento} />

          <CustomersTable data={pageData} loading={viewState === "loading"} />

          {total > 0 ? (
            <Pagination
              page={safePage}
              pageSize={PAGE_SIZE}
              total={total}
              onChange={(p) =>
                navigate({ search: (prev: ClientesSearch) => ({ ...prev, page: p }) })
              }
            />
          ) : null}

          <ContextualActionBar
            segment={segmento}
            count={segmentCounts[segmento]}
          />
        </>
      )}
    </>
  );
}
