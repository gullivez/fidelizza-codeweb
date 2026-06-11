import { Link } from "@tanstack/react-router";
import {
  User,
  MessageCircle,
  Users,
  Store,
  Sliders,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TabId =
  | "whatsapp"
  | "conta"
  | "usuarios"
  | "restaurantes"
  | "preferencias";

export type TabItem = {
  id: TabId;
  label: string;
  icon: LucideIcon;
};

export const ALL_TABS: TabItem[] = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "conta", label: "Conta", icon: User },
  { id: "usuarios", label: "Usuários & Acessos", icon: Users },
  { id: "restaurantes", label: "Restaurantes", icon: Store },
  { id: "preferencias", label: "Preferências", icon: Sliders },
];

export function SettingsNav({
  tabs,
  active,
  whatsappDisconnected,
}: {
  tabs: TabItem[];
  active: TabId;
  whatsappDisconnected: boolean;
}) {
  return (
    <nav className="flex flex-col gap-0.5">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = t.id === active;
        return (
          <Link
            key={t.id}
            to="/configuracoes"
            search={(prev: Record<string, unknown>) => ({ ...prev, tab: t.id })}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-zinc-100 font-medium text-foreground"
                : "text-muted-foreground hover:bg-zinc-50 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{t.label}</span>
            {t.id === "whatsapp" && whatsappDisconnected && (
              <span
                className="h-1.5 w-1.5 rounded-full bg-rose-500"
                aria-label="Atenção"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
