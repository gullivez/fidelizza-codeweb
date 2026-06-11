import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  accessor?: (row: T) => string | number | null | undefined;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: string;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
  rowKey?: (row: T, index: number) => string;
};

type SortState = { key: string; direction: "asc" | "desc" } | null;

export function DataTable<T>({
  columns,
  data,
  loading,
  onRowClick,
  emptyState,
  rowKey,
}: Props<T>) {
  const [sort, setSort] = useState<SortState>(null);

  const sorted = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.accessor) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = col.accessor!(a);
      const bv = col.accessor!(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sort.direction === "asc" ? av - bv : bv - av;
      }
      return sort.direction === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [data, sort, columns]);

  const toggleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/80 border-b border-border">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  data-align={c.align === "right" ? "right" : undefined}
                  style={c.width ? { width: c.width } : undefined}
                  className={cn(
                    "h-10 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    !c.align && "text-left",
                    c.sortable && "cursor-pointer select-none hover:text-foreground",
                  )}
                  onClick={() => toggleSort(c.key, c.sortable)}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.header}
                    {c.sortable ? (
                      sort?.key === c.key ? (
                        sort.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`s-${i}`} className="border-b border-border last:border-0">
                    {columns.map((c) => (
                      <td key={c.key} className="h-11 px-3">
                        <Skeleton className="h-4 w-2/3" />
                      </td>
                    ))}
                  </tr>
                ))
              : sorted.length === 0
                ? null
                : sorted.map((row, i) => (
                    <tr
                      key={rowKey ? rowKey(row, i) : i}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={cn(
                        "border-b border-border last:border-0 transition-colors",
                        onRowClick && "cursor-pointer hover:bg-zinc-50",
                      )}
                    >
                      {columns.map((c) => (
                        <td
                          key={c.key}
                          data-align={c.align === "right" ? "right" : undefined}
                          className={cn(
                            "h-11 px-3 text-foreground",
                            c.align === "right" && "text-right",
                            c.align === "center" && "text-center",
                          )}
                        >
                          {c.cell ? c.cell(row) : (c.accessor ? c.accessor(row) : null)}
                        </td>
                      ))}
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
      {!loading && sorted.length === 0 && emptyState ? (
        <div className="border-t border-border">{emptyState}</div>
      ) : null}
    </div>
  );
}
