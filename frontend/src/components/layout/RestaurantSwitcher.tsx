import { useState } from "react";
import { Check, ChevronsUpDown, Store } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useLayout } from "@/lib/layout-context";
import { cn } from "@/lib/utils";

export function RestaurantSwitcher() {
  const { restaurants, activeRestaurant, setActiveRestaurant } = useLayout();
  const [open, setOpen] = useState(false);

  if (restaurants.length <= 1) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium">
        <Store className="h-4 w-4 text-muted-foreground" />
        {activeRestaurant?.name ?? "—"}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-zinc-50 transition-colors"
        >
          <Store className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[180px] truncate">{activeRestaurant?.name ?? "—"}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Buscar restaurante..." />
          <CommandList>
            <CommandEmpty>Nenhum restaurante encontrado.</CommandEmpty>
            <CommandGroup>
              {restaurants.map((r) => {
                const active = r.id === activeRestaurant?.id;
                return (
                  <CommandItem
                    key={r.id}
                    value={r.name}
                    onSelect={() => {
                      setActiveRestaurant(r);
                      setOpen(false);
                    }}
                    className="flex items-start gap-2"
                  >
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4",
                        active ? "opacity-100 text-primary" : "opacity-0",
                      )}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{r.name}</div>
                      {r.slug && (
                        <div className="text-xs text-muted-foreground truncate">
                          {r.slug}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
