import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RestaurantSwitcher } from "./RestaurantSwitcher";

export function AppTopbar({ action }: { action?: ReactNode }) {
  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <div className="h-5 w-px bg-border" />
        <RestaurantSwitcher />
      </div>
      <div className="flex items-center gap-2">{action}</div>
    </header>
  );
}
