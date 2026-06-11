import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/common/DataTable";
import { formatNumber, type Opportunity } from "@/lib/mock-dashboard";

type Props = { data: Opportunity[]; onCreate?: (o: Opportunity) => void };

export function OpportunitiesTable({ data, onCreate }: Props) {
  const columns: Column<Opportunity>[] = [
    {
      key: "segment",
      header: "Segmento",
      accessor: (r) => r.segment,
      cell: (r) => <span className="font-medium text-foreground">{r.segment}</span>,
      sortable: true,
    },
    {
      key: "customers",
      header: "Clientes",
      accessor: (r) => r.customers,
      align: "right",
      sortable: true,
      cell: (r) => (
        <span className="num font-semibold text-foreground tabular-nums">
          {formatNumber(r.customers)}
        </span>
      ),
      width: "120px",
    },
    {
      key: "description",
      header: "Descrição",
      accessor: (r) => r.description,
      cell: (r) => <span className="text-muted-foreground">{r.description}</span>,
    },
    {
      key: "action",
      header: "",
      align: "right",
      width: "160px",
      cell: (r) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7"
          onClick={(e) => {
            e.stopPropagation();
            onCreate?.(r);
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Criar campanha
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Oportunidades agora</h3>
        <span className="text-xs text-muted-foreground">
          Segmentos prontos para acionar
        </span>
      </div>
      <DataTable columns={columns} data={data} rowKey={(r) => r.id} />
    </div>
  );
}
