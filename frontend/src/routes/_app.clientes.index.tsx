import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PlugZap, RefreshCw, Search } from "lucide-react";
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
import { segmentsApi } from "@/lib/api/segments";
import { apiSegmentToLocal, localSegmentToApi, type Customer, type Segment } from "@/lib/mock-customers";

const PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 3_000;
const POLL_MAX_ATTEMPTS = 5;

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
    segment: apiSegmentToLocal(c.segmentName),
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
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState(q);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setSearchInput(q); }, [q]);

  useEffect(() => {
    if (searchInput === q) return;
    const t = setTimeout(() => {
      void navigate({ search: (prev: ClientesSearch) => ({ ...prev, q: searchInput, page: 1 }) });
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, q, navigate]);

  const apiSegment = localSegmentToApi(segmento);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", rid, { page, q, segmento }],
    queryFn: () =>
      customersApi.list(rid, {
        page,
        limit: PAGE_SIZE,
        search: q || undefined,
        segment: apiSegment,
      }),
    enabled: !!rid,
  });

  const { data: segmentsData, refetch: refetchSegments } = useQuery({
    queryKey: ["segments", rid],
    queryFn: () => segmentsApi.getStats(rid),
    enabled: !!rid,
  });

  const handleRecalculate = useCallback(async () => {
    if (!rid || isRecalculating) return;
    setIsRecalculating(true);

    try {
      await segmentsApi.recalculate(rid);
    } catch {
      setIsRecalculating(false);
      return;
    }

    // Poll for updated segment counts, up to POLL_MAX_ATTEMPTS times
    let attempts = 0;
    const poll = () => {
      pollRef.current = setTimeout(async () => {
        attempts++;
        await refetchSegments();
        await queryClient.invalidateQueries({ queryKey: ["customers", rid] });
        if (attempts < POLL_MAX_ATTEMPTS) {
          poll();
        } else {
          setIsRecalculating(false);
        }
      }, POLL_INTERVAL_MS);
    };
    poll();
  }, [rid, isRecalculating, refetchSegments, queryClient]);

  // Cleanup polling on unmount
  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current); }, []);

  const customers: Customer[] = (data?.data ?? []).map(mapApiToCustomer);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  // Build counts for SegmentChips from real API data
  const segmentCounts = (() => {
    const counts: Record<Segment, number> = {
      todos: 0, campeoes: 0, novos: 0, "em-risco": 0, inativos: 0,
    };
    if (segmentsData) {
      const nameMap: Record<string, Segment> = {
        champions: "campeoes", new: "novos", at_risk: "em-risco", inactive: "inativos",
      };
      for (const s of segmentsData.segments) {
        const key = nameMap[s.name];
        if (key) counts[key] = s.count;
      }
      counts.todos = segmentsData.total;
    }
    return counts;
  })();

  const searchSlot = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por nome ou telefone"
          className="w-72 h-9 pl-8"
        />
      </div>
      {rid && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleRecalculate()}
          disabled={isRecalculating}
          className="h-9 gap-1.5"
        >
          {isRecalculating
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <RefreshCw className="h-4 w-4" />}
          Recalcular
        </Button>
      )}
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
          <SegmentChips active={segmento} counts={segmentCounts} />

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
