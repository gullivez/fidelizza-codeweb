import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type StatusVariant = "success" | "warning" | "danger" | "neutral" | "info";

const styles: Record<StatusVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  neutral: "bg-zinc-100 text-zinc-700 border-zinc-200",
  info: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export function StatusBadge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: StatusVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
