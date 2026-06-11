import { cn } from "@/lib/utils";

export function ProviderLogo({
  name,
  color,
  className,
}: {
  name: string;
  color: string;
  className?: string;
}) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold text-white",
        color,
        className,
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}
