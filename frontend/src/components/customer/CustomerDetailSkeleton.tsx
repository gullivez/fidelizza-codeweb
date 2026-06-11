import { Skeleton } from "@/components/ui/skeleton";

export function CustomerDetailSkeleton() {
  return (
    <>
      <div className="flex items-center gap-4 border-b border-border pb-5 mb-6">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="h-20 w-full rounded-lg mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
        <Skeleton className="h-60 w-full rounded-lg" />
      </div>
    </>
  );
}
