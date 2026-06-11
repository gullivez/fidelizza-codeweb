import { Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LayoutProvider } from "@/lib/layout-context";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";
import { WhatsAppAlertBanner } from "./WhatsAppAlertBanner";

export function AppLayout() {
  return (
    <LayoutProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "15rem",
            "--sidebar-width-icon": "4rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="bg-background">
          <AppTopbar />
          <WhatsAppAlertBanner />
          <main className="flex-1 p-6 max-w-screen-2xl w-full mx-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </LayoutProvider>
  );
}
